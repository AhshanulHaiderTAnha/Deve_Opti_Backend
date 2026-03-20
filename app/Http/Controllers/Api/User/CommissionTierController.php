<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\CommissionTier;
use Illuminate\Http\Request;

class CommissionTierController extends Controller
{
    public function index()
    {
        $tiers = CommissionTier::with(['benefits' => function($q) {
                $q->where('is_enabled', true);
            }])
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $tiers
        ]);
    }
}
