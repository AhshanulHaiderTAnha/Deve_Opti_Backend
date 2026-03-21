<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\UserTask;
use App\Models\UserOrder;
use App\Models\Product;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserTaskController extends Controller
{
    /**
     * Get the active assigned task and the "next" product to process.
     */
    public function getActiveTask(Request $request)
    {
        $userTask = UserTask::with(['orderTask.products', 'orderTask.tier'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'in_progress')
            ->first();

        if (!$userTask) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No active tasks available.'
            ]);
        }

        // Get a random product from the task's product pool
        $nextProduct = $userTask->orderTask->products->random();

        // Calculate estimated commission
        $commissionPercent = $userTask->orderTask->commission_type === 'tier' 
            ? ($userTask->orderTask->tier->commission_rate ?? 0)
            : $userTask->orderTask->manual_commission_percent;

        $commissionAmount = ($nextProduct->price * $commissionPercent) / 100;

        return response()->json([
            'success' => true,
            'data' => [
                'task' => [
                    'id' => $userTask->id,
                    'title' => $userTask->orderTask->title,
                    'completed_orders' => $userTask->completed_orders,
                    'required_orders' => $userTask->orderTask->required_orders,
                    'total_earned_commission' => $userTask->total_earned_commission,
                    'can_submit' => $userTask->completed_orders >= $userTask->orderTask->required_orders
                ],
                'next_order' => $userTask->completed_orders < $userTask->orderTask->required_orders ? [
                    'product_id' => $nextProduct->id,
                    'name' => $nextProduct->title,
                    'price' => $nextProduct->price,
                    'image' => $nextProduct->image_path ? asset('storage/' . $nextProduct->image_path) : null,
                    'platform' => $nextProduct->platform,
                    'commission_percent' => $commissionPercent,
                    'estimated_earn' => round($commissionAmount, 2)
                ] : null
            ]
        ]);
    }

    /**
     * Process a single order click.
     */
    public function processOrder(Request $request, $id)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $userTask = UserTask::with(['orderTask.products', 'orderTask.tier'])
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->where('status', 'in_progress')
            ->firstOrFail();

        if ($userTask->completed_orders >= $userTask->orderTask->required_orders) {
            return response()->json([
                'success' => false,
                'message' => 'Task is already fully completed. Please submit it.'
            ], 400);
        }

        // Ensure the product belongs to the task's pool
        if (!$userTask->orderTask->products->contains('id', $validated['product_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid product for this task.'
            ], 403);
        }

        $product = Product::findOrFail($validated['product_id']);

        $commissionPercent = $userTask->orderTask->commission_type === 'tier' 
            ? ($userTask->orderTask->tier->commission_rate ?? 0)
            : $userTask->orderTask->manual_commission_percent;

        $commissionAmount = ($product->price * $commissionPercent) / 100;

        DB::transaction(function () use ($userTask, $product, $commissionAmount) {
            UserOrder::create([
                'user_task_id' => $userTask->id,
                'product_id' => $product->id,
                'order_price' => $product->price,
                'commission_amount' => $commissionAmount,
                'status' => 'completed'
            ]);

            $userTask->increment('completed_orders');
            $userTask->total_earned_commission += $commissionAmount;
            $userTask->save();
        });

        return response()->json([
            'success' => true,
            'message' => 'Order processed successfully.',
            'task' => [
                'completed_orders' => $userTask->completed_orders,
                'total_earned_commission' => $userTask->total_earned_commission,
                'can_submit' => $userTask->completed_orders >= $userTask->orderTask->required_orders
            ]
        ]);
    }

    /**
     * Submit task and transfer earnings.
     */
    public function submitTask(Request $request, $id)
    {
        $userTask = UserTask::with(['orderTask'])
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->where('status', 'in_progress')
            ->firstOrFail();

        if ($userTask->completed_orders < $userTask->orderTask->required_orders) {
            return response()->json([
                'success' => false,
                'message' => 'You must complete all required orders before submitting.'
            ], 400);
        }

        DB::transaction(function () use ($request, $userTask) {
            // Update task status
            $userTask->update(['status' => 'completed']);

            // Credit the wallet
            $wallet = $request->user()->wallet;
            
            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'credit',
                'amount' => $userTask->total_earned_commission,
                'description' => "Commission earned from task completion: {$userTask->orderTask->title}",
                'status' => 'completed'
            ]);

            // Add straight to wallet balance
            $wallet->increment('balance', $userTask->total_earned_commission);
            
            // Log user activity
            log_user_activity(
                $request->user(),
                'Task Completed',
                "Completed task '{$userTask->orderTask->title}' and earned $" . number_format($userTask->total_earned_commission, 2)
            );

            // Dispatch Emails
            try {
                \Illuminate\Support\Facades\Mail::to($request->user()->email)->queue(new \App\Mail\TaskCompletedUser($userTask, $request->user()));
                
                $admin = env('ADMIN_EMAIL');
                if ($admin) {
                     \Illuminate\Support\Facades\Mail::to($admin)->queue(new \App\Mail\TaskCompletedAdmin($userTask, $request->user()));
                }
            } catch (\Exception $e) {
                // Ignore mail errors
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Task submitted successfully. Commissions have been added to your wallet.'
        ]);
    }
}
