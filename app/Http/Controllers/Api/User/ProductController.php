<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::where('status', 'active')
            ->latest()
            ->paginate(12);

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    public function show($slug)
    {
        $product = Product::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $product
        ]);
    }
}
