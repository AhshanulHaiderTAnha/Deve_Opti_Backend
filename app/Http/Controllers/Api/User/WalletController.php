<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;

use App\Models\DepositRequest;
use App\Models\WithdrawalRequest;

class WalletController extends Controller
{
    public function show()
    {
        $userId = auth()->id();
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $userId],
            ['balance' => 0]
        );

        $totalDepositAmount = DepositRequest::where('user_id', $userId)->where('status', 'approved')->sum('amount');
        $totalWithdrawnAmount = WithdrawalRequest::where('user_id', $userId)->where('status', 'approved')->sum('amount');
        
        $totalDepositCount = DepositRequest::where('user_id', $userId)->where('status', 'approved')->count();
        $totalWithdrawnCount = WithdrawalRequest::where('user_id', $userId)->where('status', 'approved')->count();
        
        $pendingDepositCount = DepositRequest::where('user_id', $userId)->where('status', 'pending')->count();
        $pendingWithdrawalCount = WithdrawalRequest::where('user_id', $userId)->where('status', 'pending')->count();
        
        $lastTransaction = WalletTransaction::where('user_id', $userId)->latest()->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'wallet' => $wallet,
                'summary' => [
                    'total_deposit_amount' => $totalDepositAmount,
                    'total_withdrawn_amount' => $totalWithdrawnAmount,
                    'total_deposit_count' => $totalDepositCount,
                    'total_withdrawn_count' => $totalWithdrawnCount,
                    'pending_deposit_count' => $pendingDepositCount,
                    'pending_withdrawal_count' => $pendingWithdrawalCount,
                    'last_transaction_date' => $lastTransaction ? $lastTransaction->created_at->toIso8601String() : null,
                ]
            ]
        ]);
    }

    public function transactions()
    {
        $transactions = WalletTransaction::where('user_id', auth()->id())
            ->latest()
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $transactions
        ]);
    }
}
