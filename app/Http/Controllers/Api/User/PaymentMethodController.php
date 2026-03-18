<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentMethod;

class PaymentMethodController extends Controller
{
    public function index()
    {
        $methods = PaymentMethod::where('status', 'active')
            ->with(['details' => function($query) {
                $query->where('status', 'active');
            }])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $methods
        ]);
    }

    public function show($slug)
    {
        $method = PaymentMethod::where('slug', $slug)
            ->where('status', 'active')
            ->with(['details' => function($query) {
                $query->where('status', 'active');
            }])
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $method
        ]);
    }
}
