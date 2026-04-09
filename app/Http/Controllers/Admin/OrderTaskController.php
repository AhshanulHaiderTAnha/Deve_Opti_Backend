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
    public function index(Request $request)
    {
        $query = OrderTask::with(['tier', 'products' => function ($q) {
            $q->withPivot('custom_commission_percent', 'custom_commission_type', 'custom_commission_flat')
              ->select('products.id', 'products.title', 'products.price', 'products.platform');
        }]);

        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $query->latest();

        return Inertia::render('Admin/OrderTasks/Index', [
            'tasks'           => $query->get(),
            'commissionTiers' => CommissionTier::where('status', 'active')->orderBy('sort_order')->get(),
            'products'        => Product::where('status', 'published')->orderBy('title', 'asc')->get(['id', 'title', 'price', 'platform']),
            'filters'         => $request->only(['search', 'status'])
        ]);
    }

    public function export(Request $request)
    {
        $query = OrderTask::with(['tier']);

        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query->latest()->get();

        $filename = "order_tasks_report_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];
        $columns = ['ID', 'Title', 'Commission Type', 'Tier/Rate', 'Required Orders', 'Status', 'Created At'];

        $callback = function () use ($tasks, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($tasks as $t) {
                fputcsv($file, [
                    $t->id,
                    $t->title,
                    $t->commission_type,
                    $t->commission_type === 'tier' ? ($t->tier->name ?? 'N/A') : $t->manual_commission_percent . '%',
                    $t->required_orders,
                    $t->status,
                    $t->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'                       => 'required|string|max:255',
            'commission_type'             => 'required|in:tier,manual',
            'commission_tier_id'          => 'required_if:commission_type,tier|nullable|exists:commission_tiers,id',
            'manual_commission_percent'   => 'required_if:commission_type,manual|nullable|numeric|min:0|max:100',
            'required_orders'             => 'required|integer|min:1',
            'status'                      => 'required|in:active,inactive',
            'product_ids'                 => ['required', 'array', 'size:' . $request->input('required_orders')],
            'product_ids.*'               => 'exists:products,id',
            // per-product overrides
            'product_commissions'         => 'nullable|array',
            'product_commissions.*'       => 'nullable|numeric|min:0|max:100',
            'product_commission_types'    => 'nullable|array',
            'product_commission_types.*'  => 'nullable|in:percent,flat',
            'product_flat_commissions'    => 'nullable|array',
            'product_flat_commissions.*'  => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $task = OrderTask::create([
                'title'                     => $validated['title'],
                'commission_type'           => $validated['commission_type'],
                'commission_tier_id'        => $validated['commission_type'] === 'tier' ? $validated['commission_tier_id'] : null,
                'manual_commission_percent' => $validated['commission_type'] === 'manual' ? $validated['manual_commission_percent'] : null,
                'required_orders'           => $validated['required_orders'],
                'status'                    => $validated['status'],
            ]);

            $syncData = $this->buildSyncData(
                $validated['product_ids'],
                $validated['product_commissions']      ?? [],
                $validated['product_commission_types'] ?? [],
                $validated['product_flat_commissions'] ?? [],
            );
            $task->products()->sync($syncData);
        });

        return back()->with('success', 'Order task created successfully.');
    }

    public function update(Request $request, OrderTask $orderTask)
    {
        $validated = $request->validate([
            'title'                       => 'required|string|max:255',
            'commission_type'             => 'required|in:tier,manual',
            'commission_tier_id'          => 'required_if:commission_type,tier|nullable|exists:commission_tiers,id',
            'manual_commission_percent'   => 'required_if:commission_type,manual|nullable|numeric|min:0|max:100',
            'required_orders'             => 'required|integer|min:1',
            'status'                      => 'required|in:active,inactive',
            'product_ids'                 => ['required', 'array', 'size:' . $request->input('required_orders')],
            'product_ids.*'               => 'exists:products,id',
            'product_commissions'         => 'nullable|array',
            'product_commissions.*'       => 'nullable|numeric|min:0|max:100',
            'product_commission_types'    => 'nullable|array',
            'product_commission_types.*'  => 'nullable|in:percent,flat',
            'product_flat_commissions'    => 'nullable|array',
            'product_flat_commissions.*'  => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($orderTask, $validated) {
            $orderTask->update([
                'title'                     => $validated['title'],
                'commission_type'           => $validated['commission_type'],
                'commission_tier_id'        => $validated['commission_type'] === 'tier' ? $validated['commission_tier_id'] : null,
                'manual_commission_percent' => $validated['commission_type'] === 'manual' ? $validated['manual_commission_percent'] : null,
                'required_orders'           => $validated['required_orders'],
                'status'                    => $validated['status'],
            ]);

            $syncData = $this->buildSyncData(
                $validated['product_ids'],
                $validated['product_commissions']      ?? [],
                $validated['product_commission_types'] ?? [],
                $validated['product_flat_commissions'] ?? [],
            );
            $orderTask->products()->sync($syncData);
        });

        return back()->with('success', 'Order task updated successfully.');
    }

    public function destroy(OrderTask $orderTask)
    {
        $orderTask->delete();
        return back()->with('success', 'Order task deleted successfully.');
    }

    /**
     * Build pivot sync array with per-product custom commission data.
     *
     * Rules per product:
     *  - type = null  → inherit task default (both values null)
     *  - type = percent → custom_commission_percent set, custom_commission_flat null
     *  - type = flat    → custom_commission_flat set, custom_commission_percent null
     */
    private function buildSyncData(
        array $productIds,
        array $commissions,      // [pid => percent value]
        array $commissionTypes,  // [pid => 'percent'|'flat'|'']
        array $flatCommissions   // [pid => flat value]
    ): array {
        $sync = [];

        foreach ($productIds as $pid) {
            $type = isset($commissionTypes[$pid]) && $commissionTypes[$pid] !== '' ? $commissionTypes[$pid] : null;

            $percentValue = null;
            $flatValue    = null;

            if ($type === 'percent') {
                $val = $commissions[$pid] ?? null;
                $percentValue = ($val !== null && $val !== '') ? (float) $val : null;
                // If no valid percent entered, treat as no override
                if ($percentValue === null) {
                    $type = null;
                }
            } elseif ($type === 'flat') {
                $val = $flatCommissions[$pid] ?? null;
                $flatValue = ($val !== null && $val !== '') ? (float) $val : null;
                if ($flatValue === null) {
                    $type = null;
                }
            }

            $sync[$pid] = [
                'custom_commission_type'    => $type,
                'custom_commission_percent' => $percentValue,
                'custom_commission_flat'    => $flatValue,
            ];
        }

        return $sync;
    }
}
