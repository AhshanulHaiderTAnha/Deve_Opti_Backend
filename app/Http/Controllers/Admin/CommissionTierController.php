<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionTier;
use App\Models\CommissionTierBenefit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CommissionTierController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/CommissionTiers/Index', [
            'tiers' => CommissionTier::with('benefits')->orderBy('sort_order')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_amount' => 'required|numeric|min:0',
            'max_amount' => 'nullable|numeric|gt:min_amount',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'sort_order' => 'integer',
            'benefits' => 'required|array|min:1',
            'benefits.*.benefit' => 'required|string',
            'benefits.*.is_enabled' => 'boolean'
        ]);

        DB::transaction(function () use ($validated) {
            $tier = CommissionTier::create($validated);
            foreach ($validated['benefits'] as $benefit) {
                $tier->benefits()->create($benefit);
            }
        });

        return back()->with('success', 'Commission tier created successfully.');
    }

    public function update(Request $request, CommissionTier $commissionTier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_amount' => 'required|numeric|min:0',
            'max_amount' => 'nullable|numeric|gt:min_amount',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'sort_order' => 'integer',
            'benefits' => 'required|array|min:1',
            'benefits.*.benefit' => 'required|string',
            'benefits.*.is_enabled' => 'boolean'
        ]);

        DB::transaction(function () use ($validated, $commissionTier) {
            $commissionTier->update($validated);
            $commissionTier->benefits()->delete();
            foreach ($validated['benefits'] as $benefit) {
                $commissionTier->benefits()->create($benefit);
            }
        });

        return back()->with('success', 'Commission tier updated successfully.');
    }

    public function destroy(CommissionTier $commissionTier)
    {
        $commissionTier->delete();
        return back()->with('success', 'Commission tier deleted successfully.');
    }
}
