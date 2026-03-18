<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DepositPlan;

class DepositPlanController extends Controller
{
    public function index()
    {
        $plans = DepositPlan::with(['benefits', 'levels'])
            ->where('status', 'published')
            ->latest()
            ->paginate(12);

        return response()->json([
            'status' => 'success',
            'data' => $plans
        ]);
    }

    public function show($slug)
    {
        $plan = DepositPlan::with(['benefits', 'levels'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $plan
        ]);
    }
}
