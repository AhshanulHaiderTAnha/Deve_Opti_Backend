<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\OrderRequest;
use App\Models\UserActivityLog;
use App\Mail\OrderRequestAdminMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class OrderRequestController extends Controller
{
    public function index()
    {
        $requests = OrderRequest::where('user_id', auth()->id())
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $requests
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'order_request_data' => 'required|string',
        ]);

        $orderRequest = OrderRequest::create([
            'user_id' => auth()->id(),
            'order_request_data' => $request->order_request_data,
            'status' => 'pending',
        ]);

        UserActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'Order Request Created',
            'details' => "Created a new order request",
            'ip_address' => $request->ip()
        ]);

        // Send Email to Admin
        $adminEmail = env('ADMIN_EMAIL');
        if ($adminEmail) {
            Mail::to($adminEmail)->send(new OrderRequestAdminMail($orderRequest, auth()->user(), 'created'));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Order request submitted successfully',
            'data' => $orderRequest
        ]);
    }

    public function cancel($id)
    {
        $orderRequest = OrderRequest::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        if ($orderRequest->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pending requests can be cancelled.'
            ], 403);
        }

        $orderRequest->update(['status' => 'cancelled']);

        UserActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'Order Request Cancelled',
            'details' => "Cancelled order request #{$id}",
            'ip_address' => request()->ip()
        ]);

        // Send Email to Admin
        $adminEmail = env('ADMIN_EMAIL');
        if ($adminEmail) {
            Mail::to($adminEmail)->send(new OrderRequestAdminMail($orderRequest, auth()->user(), 'cancelled'));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Order request cancelled successfully'
        ]);
    }
}
