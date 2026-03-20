<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DepositPlan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DepositPlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DepositPlan::with(['levels'])->withCount(['benefits', 'levels']);

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return Inertia::render('Admin/DepositPlans/Index', [
            'plans' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'duration' => 'required|integer|min:1',
            'duration_type' => 'required|in:hours,days,weeks,months,years',
            'status' => 'required|in:published,inactive',
            'image' => 'nullable|image|max:2048',
            'benefits' => 'nullable|array',
            'benefits.*' => 'required|string|max:255',
            'levels' => 'required|array|min:1',
            'levels.*.amount' => 'required|numeric|min:0',
            'levels.*.profit_value' => 'required|numeric|min:0',
            'levels.*.profit_type' => 'required|in:fixed,percentage',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(5);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('deposit_plans', 'public');
        }

        DB::transaction(function () use ($validated, $request) {
            $plan = DepositPlan::create($validated);

            if ($request->benefits) {
                foreach ($request->benefits as $benefitText) {
                    $plan->benefits()->create(['benefit_text' => $benefitText]);
                }
            }

            if ($request->levels) {
                foreach ($request->levels as $levelData) {
                    $plan->levels()->create($levelData);
                }
            }
        });

        return back()->with('success', 'Deposit plan created successfully.');
    }

    public function update(Request $request, DepositPlan $depositPlan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'duration' => 'required|integer|min:1',
            'duration_type' => 'required|in:hours,days,weeks,months,years',
            'status' => 'required|in:published,inactive',
            'image' => 'nullable|image|max:2048',
            'benefits' => 'nullable|array',
            'benefits.*' => 'required|string|max:255',
            'levels' => 'required|array|min:1',
            'levels.*.amount' => 'required|numeric|min:0',
            'levels.*.profit_value' => 'required|numeric|min:0',
            'levels.*.profit_type' => 'required|in:fixed,percentage',
        ]);

        if ($request->hasFile('image')) {
            if ($depositPlan->image_path) {
                Storage::disk('public')->delete($depositPlan->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('deposit_plans', 'public');
        }

        DB::transaction(function () use ($depositPlan, $validated, $request) {
            $depositPlan->update($validated);

            if ($request->has('benefits')) {
                $depositPlan->benefits()->delete();
                foreach ($request->benefits as $benefitText) {
                    $depositPlan->benefits()->create(['benefit_text' => $benefitText]);
                }
            }

            if ($request->has('levels')) {
                $depositPlan->levels()->delete();
                foreach ($request->levels as $levelData) {
                    $depositPlan->levels()->create($levelData);
                }
            }
        });

        return back()->with('success', 'Deposit plan updated successfully.');
    }

    public function destroy(DepositPlan $depositPlan)
    {
        if ($depositPlan->image_path) {
            Storage::disk('public')->delete($depositPlan->image_path);
        }
        $depositPlan->delete();

        return back()->with('success', 'Deposit plan deleted successfully.');
    }
}
