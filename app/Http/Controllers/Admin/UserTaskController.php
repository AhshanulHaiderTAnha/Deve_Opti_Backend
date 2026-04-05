<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderTask;
use App\Models\UserTask;
use App\Models\User;
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
              ->withSum('products', 'price');
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

        return Inertia::render('Admin/OrderTasks/UserAssignments', [
            'assignments' => $query->latest()->paginate(15)->withQueryString(),
            'users' => User::role('user')->get(['id', 'name', 'email']),
            'tasks' => OrderTask::where('status', 'active')->get(['id', 'title', 'required_orders', 'commission_type']),
            'filters' => $request->only(['search', 'status', 'start_date', 'end_date'])
        ]);
    }

    public function export(Request $request)
    {
        $query = UserTask::with(['user:id,name,email', 'orderTask' => function ($q) {
            $q->select('id', 'title', 'required_orders', 'commission_type')
              ->withSum('products', 'price');
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
        $columns = ['ID', 'User Name', 'User Email', 'Task Title', 'Completed', 'Required', 'Earned ($)', 'Current Order Price', 'Status', 'Date Assigned'];

        $callback = function() use($assignments, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($assignments as $a) {
                fputcsv($file, [
                    $a->id,
                    $a->user->name ?? 'N/A',
                    $a->user->email ?? 'N/A',
                    $a->orderTask->title ?? 'N/A',
                    $a->completed_orders,
                    $a->orderTask->required_orders ?? 0,
                    $a->total_earned_commission,
                    $a->orderTask->products_sum_price ?? 0,
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

    public function destroy(UserTask $userTask)
    {
        if ($userTask->status === 'completed') {
            return back()->with('error', 'Cannot delete a completed task.');
        }
        
        $userTask->delete();
        return back()->with('success', 'Task assignment removed from user.');
    }
}
