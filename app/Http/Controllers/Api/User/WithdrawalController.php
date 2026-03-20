<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\WithdrawalRequest;
use App\Models\Wallet;
use App\Mail\WithdrawalRequestAdminMail;
use App\Mail\WithdrawalRequestUserMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class WithdrawalController extends Controller
{
    public function index()
    {
        $withdrawals = WithdrawalRequest::where('user_id', auth()->id())
            ->latest()
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $withdrawals
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_gateway_info' => 'required|string',
        ]);

        // Check if user has sufficient funds (balance - pending withdrawals)
        $wallet = Wallet::firstOrCreate(
            ['user_id' => auth()->id()],
            ['balance' => 0]
        );

        $pendingWithdrawals = WithdrawalRequest::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->sum('amount');

        $availableBalance = $wallet->balance - $pendingWithdrawals;

        if ($availableBalance < $request->amount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Insufficient available balance. You may have pending withdrawal requests.'
            ], 400);
        }

        $withdrawal = WithdrawalRequest::create([
            'user_id' => auth()->id(),
            'amount' => $request->amount,
            'payment_gateway_info' => $request->payment_gateway_info,
            'status' => 'pending'
        ]);

        \App\Models\UserActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'Withdrawal Requested',
            'details' => "Requested \${$request->amount} withdrawal",
            'ip_address' => $request->ip()
        ]);

        // Send Emails
        $adminEmail = env('ADMIN_EMAIL');
        if ($adminEmail) {
            Mail::to($adminEmail)->send(new WithdrawalRequestAdminMail($withdrawal));
        }
        Mail::to(auth()->user()->email)->send(new WithdrawalRequestUserMail($withdrawal));

        return response()->json([
            'status' => 'success',
            'message' => 'Withdrawal request submitted successfully.',
            'data' => $withdrawal
        ]);
    }

    public function destroy($id)
    {
        $withdrawal = WithdrawalRequest::where('user_id', auth()->id())->findOrFail($id);
        
        if ($withdrawal->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pending withdrawal requests can be deleted.'
            ], 400);
        }

        $withdrawal->delete();

        \App\Models\UserActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'Withdrawal Request Cancelled',
            'details' => "Cancelled withdrawal request #{$id}",
            'ip_address' => request()->ip()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Withdrawal request deleted successfully.'
        ]);
    }
}
