<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderRequest;
use Illuminate\Http\Request;

class OrderRequestController extends Controller
{
    public function index()
    {
        $requests = OrderRequest::with('user:id,name,email')
            ->latest()
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $requests
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $orderRequest = OrderRequest::findOrFail($id);
        $orderRequest->update(['status' => $request->status]);

        return response()->json([
            'status' => 'success',
            'message' => "Order request " . ucfirst($request->status) . " successfully",
            'data' => $orderRequest
        ]);
    }
}
