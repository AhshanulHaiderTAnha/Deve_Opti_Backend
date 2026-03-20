<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\DepositRequest;
use App\Mail\DepositRequestAdminMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class DepositController extends Controller
{
    public function index()
    {
        $deposits = DepositRequest::with(['depositPlan', 'paymentMethod'])
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(20);

        // Add screenshot URLs
        $deposits->getCollection()->transform(function($d) {
            $d->screenshot_url = $d->screenshot_path ? asset('storage/' . $d->screenshot_path) : null;
            return $d;
        });

        return response()->json([
            'status' => 'success',
            'data' => $deposits
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'deposit_plan_id' => 'required|exists:deposit_plans,id',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'amount' => 'required|numeric|min:1',
            'transaction_id' => 'nullable|string',
            'screenshot' => 'nullable|image|max:5120',
            'comments' => 'nullable|string'
        ]);

        $data = $request->except('screenshot');
        $data['user_id'] = auth()->id();
        $data['status'] = 'pending';

        if ($request->hasFile('screenshot')) {
            $data['screenshot_path'] = $request->file('screenshot')->store('deposits', 'public');
        }

        $deposit = DepositRequest::create($data);

        // Notify Admin
        $adminEmail = env('ADMIN_EMAIL');
        if ($adminEmail) {
            Mail::to($adminEmail)->send(new DepositRequestAdminMail($deposit));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Deposit request submitted successfully.',
            'data' => $deposit
        ]);
    }
}
