<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $wallets = Wallet::with('user')->orderByDesc('balance')->paginate(20);
        return Inertia::render('Admin/Wallets/Index', [
            'wallets' => $wallets
        ]);
    }
}
