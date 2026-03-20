<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function show()
    {
        $wallet = Wallet::firstOrCreate(
            ['user_id' => auth()->id()],
            ['balance' => 0]
        );

        return response()->json([
            'status' => 'success',
            'data' => $wallet
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
