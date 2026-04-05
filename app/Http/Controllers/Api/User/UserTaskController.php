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
        $userTask = UserTask::with(['orderTask.products' => function ($q) {
            $q->withPivot('custom_commission_percent', 'custom_commission_type', 'custom_commission_flat');
        }, 'orderTask.tier'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'in_progress')
            ->first();

        if (!$userTask) {
            return response()->json([
                'success' => true,
                'data'    => null,
                'message' => 'No active tasks available.'
            ]);
        }

        // Pick a random product from the task's product pool
        $nextProduct = $userTask->orderTask->products->random();

        // Resolve commission for this product
        $commission = $this->resolveCommission($nextProduct, $userTask->orderTask);

        return response()->json([
            'success' => true,
            'data'    => [
                'task' => [
                    'id'                      => $userTask->id,
                    'title'                   => $userTask->orderTask->title,
                    'completed_orders'        => $userTask->completed_orders,
                    'required_orders'         => $userTask->orderTask->required_orders,
                    'total_earned_commission' => $userTask->total_earned_commission,
                    'can_submit'              => $userTask->completed_orders >= $userTask->orderTask->required_orders,
                ],
                'next_order' => $userTask->completed_orders < $userTask->orderTask->required_orders ? [
                    'product_id'          => $nextProduct->id,
                    'name'                => $nextProduct->title,
                    'price'               => $nextProduct->price,
                    'image'               => $nextProduct->image_path ? asset('storage/' . $nextProduct->image_path) : null,
                    'platform'            => $nextProduct->platform,
                    'commission_type'     => $commission['type'],      // 'percent' | 'flat' | 'task_default'
                    'commission_percent'  => $commission['percent'],   // null if flat
                    'commission_flat'     => $commission['flat'],      // null if percent
                    'estimated_earn'      => $commission['amount'],
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

        $userTask = UserTask::with(['orderTask.products' => function ($q) {
            $q->withPivot('custom_commission_percent', 'custom_commission_type', 'custom_commission_flat');
        }, 'orderTask.tier'])
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
        $product = $userTask->orderTask->products->firstWhere('id', $validated['product_id']);
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid product for this task.'
            ], 403);
        }

        // Resolve commission (percent or flat override, or task default)
        $commission = $this->resolveCommission($product, $userTask->orderTask);

        DB::transaction(function () use ($request, $userTask, $product, $commission) {
            UserOrder::create([
                'user_task_id'      => $userTask->id,
                'product_id'        => $product->id,
                'order_price'       => $product->price,
                'commission_amount' => $commission['amount'],
                'status'            => 'completed'
            ]);

            $userTask->increment('completed_orders');
            $userTask->total_earned_commission += $commission['amount'];
            $userTask->save();

            // Instant wallet credit
            $wallet = $request->user()->wallet;
            
            WalletTransaction::create([
                'user_id'       => $request->user()->id,
                'wallet_id'     => $wallet->id,
                'type'          => 'credit',
                'amount'        => $commission['amount'],
                'balance_after' => $wallet->balance + $commission['amount'],
                'description'   => "Commission earned from order: {$product->title} (Task: {$userTask->orderTask->title})",
                'status'        => 'completed'
            ]);

            $wallet->increment('balance', $commission['amount']);

            // Activity Log for per-order commission
            \App\Models\UserActivityLog::create([
                'user_id'    => $request->user()->id,
                'action'     => 'Commission Earned',
                'details'    => "Earned \$" . number_format($commission['amount'], 2) . " from order '{$product->title}'",
                'ip_address' => $request->ip()
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Order processed successfully.',
            'task'    => [
                'completed_orders'        => $userTask->completed_orders,
                'total_earned_commission' => $userTask->total_earned_commission,
                'can_submit'              => $userTask->completed_orders >= $userTask->orderTask->required_orders,
            ]
        ]);
    }

    /**
     * Submit task and transfer earnings.
     * Re-sums from user_orders for accuracy (handles per-product custom rates + flat amounts).
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
            // Re-sum from actual order records (accurate regardless of mixed percent/flat rates)
            $finalEarned = UserOrder::where('user_task_id', $userTask->id)
                ->sum('commission_amount');

            // Update task status and confirmed commission total
            $userTask->update([
                'status'                  => 'completed',
                'total_earned_commission' => $finalEarned,
            ]);

            // Log final task completion activity
            \App\Models\UserActivityLog::create([
                'user_id'    => $request->user()->id,
                'action'     => 'Task Completed',
                'details'    => "Completed task '{$userTask->orderTask->title}' (Total Earnings: $" . number_format($finalEarned, 2) . ")",
                'ip_address' => $request->ip()
            ]);

            // Dispatch emails
            try {
                \Illuminate\Support\Facades\Mail::to($request->user()->email)
                    ->queue(new \App\Mail\TaskCompletedUser($userTask, $request->user()));

                $admin = env('ADMIN_EMAIL');
                if ($admin) {
                    \Illuminate\Support\Facades\Mail::to($admin)
                        ->queue(new \App\Mail\TaskCompletedAdmin($userTask, $request->user()));
                }
            } catch (\Exception $e) {
                // Ignore mail errors
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Task submitted successfully.',
       ]);
    }

    /**
     * Resolve the commission amount and metadata for a product in a task.
     *
     * Priority:
     *  1. Product pivot: custom_commission_type = 'flat'    → commission = custom_commission_flat (fixed $)
     *  2. Product pivot: custom_commission_type = 'percent' → commission = price * custom_commission_percent / 100
     *  3. Task default                                      → commission = price * task_default_rate / 100
     *
     * Returns array: ['amount' => float, 'type' => string, 'percent' => float|null, 'flat' => float|null]
     */
    private function resolveCommission($product, $orderTask): array
    {
        $pivotType = $product->pivot->custom_commission_type ?? null;

        if ($pivotType === 'flat') {
            $flatAmount = (float) ($product->pivot->custom_commission_flat ?? 0);
            return [
                'amount'  => round($flatAmount, 2),
                'type'    => 'flat',
                'percent' => null,
                'flat'    => $flatAmount,
            ];
        }

        if ($pivotType === 'percent') {
            $rate   = (float) ($product->pivot->custom_commission_percent ?? 0);
            $amount = ($product->price * $rate) / 100;
            return [
                'amount'  => round($amount, 2),
                'type'    => 'percent',
                'percent' => $rate,
                'flat'    => null,
            ];
        }

        // Task-level default (always percent-based)
        $defaultRate = $this->getTaskDefaultRate($orderTask);
        $amount      = ($product->price * $defaultRate) / 100;
        return [
            'amount'  => round($amount, 2),
            'type'    => 'task_default',
            'percent' => $defaultRate,
            'flat'    => null,
        ];
    }

    /**
     * Resolve the task-level default commission rate (always a percentage).
     */
    private function getTaskDefaultRate($orderTask): float
    {
        if ($orderTask->commission_type === 'tier') {
            return (float) ($orderTask->tier->commission_rate ?? 0);
        }
        return (float) ($orderTask->manual_commission_percent ?? 0);
    }
}
