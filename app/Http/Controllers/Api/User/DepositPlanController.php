<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\DepositPlan;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DepositPlanController extends Controller
{
    /**
     * Return all published deposit plans with their active levels and benefits.
     */
    public function index()
    {
        $plans = DepositPlan::with([
                'benefits' => fn ($q) => $q->where('status', 'active')->select('id', 'deposit_plan_id', 'benefit_text'),
                'levels'   => fn ($q) => $q->where('status', 'active')
                                           ->select('id', 'deposit_plan_id', 'amount', 'profit_value', 'profit_type')
                                           ->orderBy('amount'),
            ])
            ->where('status', 'published')
            ->latest()
            ->get()
            ->map(fn ($plan) => $this->formatPlan($plan));

        return response()->json([
            'status' => 'success',
            'data'   => $plans,
        ]);
    }

    /**
     * Return a single published deposit plan by slug.
     */
    public function show(string $slug)
    {
        try {
            $plan = DepositPlan::with([
                    'benefits' => fn ($q) => $q->where('status', 'active')->select('id', 'deposit_plan_id', 'benefit_text'),
                    'levels'   => fn ($q) => $q->where('status', 'active')
                                               ->select('id', 'deposit_plan_id', 'amount', 'profit_value', 'profit_type')
                                               ->orderBy('amount'),
                ])
                ->where('slug', $slug)
                ->where('status', 'published')
                ->firstOrFail();

        } catch (ModelNotFoundException) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Deposit plan not found.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $this->formatPlan($plan),
        ]);
    }

    /**
     * Shape a DepositPlan into the desired API response structure.
     */
    private function formatPlan(DepositPlan $plan): array
    {
        return [
            'id'            => $plan->id,
            'name'          => $plan->name,
            'slug'          => $plan->slug,
            'duration'      => $plan->duration,
            'duration_type' => $plan->duration_type,
            'status'        => $plan->status,
            'image_url'     => $plan->image_url,
            'benefits'      => $plan->benefits->pluck('benefit_text'),
            'levels'        => $plan->levels->map(fn ($l) => [
                'id'          => $l->id,
                'amount'      => (float) $l->amount,
                'profit_value'=> (float) $l->profit_value,
                'profit_type' => $l->profit_type,
            ]),
            'created_at'    => $plan->created_at,
        ];
    }
}
