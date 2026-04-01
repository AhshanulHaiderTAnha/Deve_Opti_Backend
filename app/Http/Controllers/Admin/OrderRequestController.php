<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderRequestController extends Controller
{
    public function index()
    {
        $requests = OrderRequest::with('user:id,name,email')
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/OrderRequests/Index', [
            'orderRequests' => $requests
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $orderRequest = OrderRequest::findOrFail($id);
        $orderRequest->update(['status' => $request->status]);

        return back()->with('success', "Order request " . $request->status . " successfully.");
    }
}
