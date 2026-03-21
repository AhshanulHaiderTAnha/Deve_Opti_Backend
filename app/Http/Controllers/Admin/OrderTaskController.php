<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderTask;
use App\Models\CommissionTier;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class OrderTaskController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/OrderTasks/Index', [
            'tasks' => OrderTask::with(['tier', 'products:id,title'])->latest()->get(),
            'commissionTiers' => CommissionTier::where('status', 'active')->orderBy('sort_order')->get(),
            'products' => Product::where('status', 'published')->get(['id', 'title', 'price', 'platform'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'commission_type' => 'required|in:tier,manual',
            'commission_tier_id' => 'required_if:commission_type,tier|nullable|exists:commission_tiers,id',
            'manual_commission_percent' => 'required_if:commission_type,manual|nullable|numeric|min:0|max:100',
            'required_orders' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id'
        ]);

        DB::transaction(function () use ($validated) {
            $task = OrderTask::create([
                'title' => $validated['title'],
                'commission_type' => $validated['commission_type'],
                'commission_tier_id' => $validated['commission_type'] === 'tier' ? $validated['commission_tier_id'] : null,
                'manual_commission_percent' => $validated['commission_type'] === 'manual' ? $validated['manual_commission_percent'] : null,
                'required_orders' => $validated['required_orders'],
                'status' => $validated['status'],
            ]);

            $task->products()->sync($validated['product_ids']);
        });

        return back()->with('success', 'Order task created successfully.');
    }

    public function update(Request $request, OrderTask $orderTask)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'commission_type' => 'required|in:tier,manual',
            'commission_tier_id' => 'required_if:commission_type,tier|nullable|exists:commission_tiers,id',
            'manual_commission_percent' => 'required_if:commission_type,manual|nullable|numeric|min:0|max:100',
            'required_orders' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id'
        ]);

        DB::transaction(function () use ($orderTask, $validated) {
            $orderTask->update([
                'title' => $validated['title'],
                'commission_type' => $validated['commission_type'],
                'commission_tier_id' => $validated['commission_type'] === 'tier' ? $validated['commission_tier_id'] : null,
                'manual_commission_percent' => $validated['commission_type'] === 'manual' ? $validated['manual_commission_percent'] : null,
                'required_orders' => $validated['required_orders'],
                'status' => $validated['status'],
            ]);

            $orderTask->products()->sync($validated['product_ids']);
        });

        return back()->with('success', 'Order task updated successfully.');
    }

    public function destroy(OrderTask $orderTask)
    {
        $orderTask->delete();
        return back()->with('success', 'Order task deleted successfully.');
    }
}
