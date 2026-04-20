<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderTask;
use App\Models\UserTask;
use App\Models\User;
use App\Models\UserOrder;
use App\Models\UserActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\TaskAssignedUser;

class UserTaskController extends Controller
{
    public function index(Request $request)
    {
        $query = UserTask::with(['user:id,name,email', 'orderTask' => function ($q) {
            $q->select('id', 'title', 'required_orders', 'commission_type')
              ->withSum('products', 'price')
              ->with('products:id,title,price');
        }]);

        if ($request->filled('search')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        $assignments = $query->latest()->paginate(15)->through(function ($assignment) {
            $nextProduct = null;
            if ($assignment->orderTask && $assignment->orderTask->products->isNotEmpty() && $assignment->status !== 'completed') {
                $products = $assignment->orderTask->products;
                $index = $assignment->completed_orders % $products->count();
                $nextProduct = $products->get($index);
            }

            $assignment->next_product_name = $nextProduct ? $nextProduct->title : ($assignment->status === 'completed' ? 'Completed' : 'N/A');
            $assignment->next_product_price = $nextProduct ? (float)$nextProduct->price : 0;
            return $assignment;
        });

        return Inertia::render('Admin/OrderTasks/UserAssignments', [
            'assignments' => $assignments->withQueryString(),
            'users' => User::role('user')->get(['id', 'name', 'email']),
            'tasks' => OrderTask::where('status', 'active')->get(['id', 'title', 'required_orders', 'commission_type']),
            'filters' => $request->only(['search', 'status', 'start_date', 'end_date'])
        ]);
    }

    public function export(Request $request)
    {
        $query = UserTask::with(['user:id,name,email', 'orderTask' => function ($q) {
            $q->select('id', 'title', 'required_orders', 'commission_type')
              ->withSum('products', 'price')
              ->with('products:id,title,price');
        }]);

        if ($request->filled('search')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        $assignments = $query->latest()->get();

        $filename = "user_tasks_report_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];
        $columns = ['ID', 'User Name', 'User Email', 'Task Title', 'Completed', 'Required', 'Earned ($)', 'Next Product Name', 'Next Product Price', 'Status', 'Date Assigned'];

        $callback = function() use($assignments, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($assignments as $a) {
                $nextProduct = null;
                if ($a->orderTask && $a->orderTask->products->isNotEmpty() && $a->status !== 'completed') {
                    $products = $a->orderTask->products;
                    $index = $a->completed_orders % $products->count();
                    $nextProduct = $products->get($index);
                }
                $nextName = $nextProduct ? $nextProduct->title : ($a->status === 'completed' ? 'Completed' : 'N/A');
                $nextPrice = $nextProduct ? (float)$nextProduct->price : 0;

                fputcsv($file, [
                    $a->id,
                    $a->user->name ?? 'N/A',
                    $a->user->email ?? 'N/A',
                    $a->orderTask->title ?? 'N/A',
                    $a->completed_orders,
                    $a->orderTask->required_orders ?? 0,
                    $a->total_earned_commission,
                    $nextName,
                    $nextPrice,
                    $a->status,
                    $a->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'order_task_id' => 'required|exists:order_tasks,id',
        ]);

        // Check if user already has an active task
        $hasActive = UserTask::where('user_id', $validated['user_id'])
            ->where('status', 'in_progress')
            ->exists();

        if ($hasActive) {
            return back()->with('error', 'User already has an active task in progress. They must complete it first.');
        }

        $userTask = UserTask::create([
            'user_id' => $validated['user_id'],
            'order_task_id' => $validated['order_task_id'],
            'status' => 'in_progress',
            'completed_orders' => 0,
            'total_earned_commission' => 0
        ]);

        $user = User::find($validated['user_id']);

        // Send Email & Log Activity
        try {
            Mail::to($user->email)->queue(new TaskAssignedUser($userTask->load('orderTask'), $user));
        } catch (\Exception $e) {
            // Mute email errors
        }

        \App\Models\UserActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Task Assigned',
            'details' => "Admin assigned you the task: {$userTask->orderTask->title}. Complete all {$userTask->orderTask->required_orders} orders to earn your commission.",
            'ip_address' => $request->ip()
        ]);

        return back()->with('success', 'Task successfully assigned to user and notification sent.');
    }

    public function show(UserTask $userTask)
    {
        $userTask->load(['user:id,name,email', 'orderTask.products', 'orders.product']);

        $nextProduct = null;
        if ($userTask->orderTask && $userTask->orderTask->products->isNotEmpty() && $userTask->status !== 'completed') {
            $products = $userTask->orderTask->products;
            $index = $userTask->completed_orders % $products->count();
            $nextProduct = $products->get($index);
        }

        return Inertia::render('Admin/OrderTasks/UserTaskDetails', [
            'assignment' => $userTask,
            'nextProduct' => $nextProduct,
            'orderHistory' => $userTask->orders()->with('product')->latest()->get()
        ]);
    }

    public function skipOrder(Request $request, UserTask $userTask)
    {
        if ($userTask->status !== 'in_progress') {
            return back()->with('error', 'Cannot skip order for a task that is not in progress.');
        }

        $products = $userTask->orderTask->products;
        if ($products->isEmpty()) {
            return back()->with('error', 'No products found for this task batch.');
        }

        $index = $userTask->completed_orders % $products->count();
        $product = $products->get($index);

        \Illuminate\Support\Facades\DB::transaction(function () use ($userTask, $product, $request) {
            UserOrder::create([
                'user_task_id' => $userTask->id,
                'product_id' => $product->id,
                'order_price' => $product->price,
                'commission_amount' => 0,
                'status' => 'skipped'
            ]);

            $userTask->increment('completed_orders');
            
            // Sync commission from actual orders
            $userTask->total_earned_commission = UserOrder::where('user_task_id', $userTask->id)->sum('commission_amount');

            // Complete task if limit reached
            if ($userTask->completed_orders >= ($userTask->orderTask->required_orders ?? 0)) {
                $userTask->status = 'completed';
            }

            $userTask->save();

            UserActivityLog::create([
                'user_id' => $userTask->user_id,
                'action' => 'Order Skipped by Admin',
                'details' => "Admin skipped order for '{$product->title}'. This order counts as done with \$0 commission.",
                'ip_address' => $request->ip()
            ]);

            UserActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Admin Skipped User Order',
                'details' => "Skipped order '{$product->title}' for User ID: {$userTask->user_id}.",
                'ip_address' => $request->ip()
            ]);
        });

        return back()->with('success', "Order for '{$product->title}' has been skipped successfully.");
    }

    public function destroy(UserTask $userTask)
    {
        if ($userTask->status === 'completed') {
            return back()->with('error', 'Cannot delete a completed task.');
        }
        
        $userTask->delete();
        return back()->with('success', 'Task assignment removed from user.');
    }
}
