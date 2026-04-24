<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\UserActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $query = Wallet::with('user');

        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('updated_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        $query->orderByDesc('balance');

        if ($request->boolean('export')) {
            return $this->exportCsv($query->get());
        }

        return Inertia::render('Admin/Wallets/Index', [
            'wallets' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'start_date', 'end_date'])
        ]);
    }

    public function deposit(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:500'
        ]);

        $wallet = Wallet::where('user_id', $request->user_id)->firstOrFail();

        DB::transaction(function () use ($request, $wallet) {
            $oldBalance = $wallet->balance;
            $wallet->increment('balance', $request->amount);

            WalletTransaction::create([
                'user_id' => $request->user_id,
                'type' => 'credit',
                'amount' => $request->amount,
                'balance_after' => $oldBalance + $request->amount,
                'description' => "Manual Deposit by Admin: " . $request->description,
                'reference_type' => 'manual_deposit',
                'reference_id' => auth()->id()
            ]);

            UserActivityLog::create([
                'user_id' => $request->user_id,
                'action' => 'Manual Deposit Received',
                'details' => "Admin manually deposited \${$request->amount}. Note: {$request->description}",
                'ip_address' => $request->ip()
            ]);

            // Log Admin action too
            UserActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Admin Manual Deposit',
                'details' => "Manually deposited \${$request->amount} into User ID: {$request->user_id}'s wallet.",
                'ip_address' => $request->ip()
            ]);
        });

        return back()->with('success', 'Manual deposit processed successfully.');
    }

    public function withdraw(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:500',
            'status' => 'required|in:pending,approved'
        ]);

        $wallet = Wallet::where('user_id', $request->user_id)->firstOrFail();

        if ($request->status === 'approved' && $wallet->balance < $request->amount) {
            return back()->with('error', 'Insufficient balance for an approved withdrawal.');
        }

        DB::transaction(function () use ($request, $wallet) {
            $wallet = Wallet::where('user_id', $request->user_id)->lockForUpdate()->firstOrFail();
            
            // Re-check balance inside transaction if approved
            if ($request->status === 'approved' && $wallet->balance < $request->amount) {
                throw new \Exception('Insufficient balance.');
            }

            $withdrawal = \App\Models\WithdrawalRequest::create([
                'user_id' => $request->user_id,
                'amount' => $request->amount,
                'payment_gateway_info' => 'Manual Admin Withdrawal: ' . $request->description,
                'status' => $request->status,
                'admin_comments' => $request->description,
                'reviewed_by' => $request->status === 'approved' ? auth()->id() : null,
                'reviewed_at' => $request->status === 'approved' ? now() : null,
                'admin_transaction_id' => $request->status === 'approved' ? 'MANUAL_ADMIN_WITHDRAWAL' : null,
            ]);

            if ($request->status === 'approved') {
                $oldBalance = $wallet->balance;
                $wallet->balance -= $request->amount;
                $wallet->save();

                WalletTransaction::create([
                    'user_id' => $request->user_id,
                    'type' => 'debit',
                    'amount' => $request->amount,
                    'balance_after' => $oldBalance - $request->amount,
                    'description' => "Manual Withdrawal by Admin: " . $request->description,
                    'reference_type' => 'manual_withdrawal',
                    'reference_id' => auth()->id()
                ]);
            }

            UserActivityLog::create([
                'user_id' => $request->user_id,
                'action' => 'Manual Withdrawal ' . ucfirst($request->status),
                'details' => "Admin manually created a " . $request->status . " withdrawal of \${$request->amount}. Note: {$request->description}",
                'ip_address' => $request->ip()
            ]);

            // Log Admin action too
            UserActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'Admin Manual Withdrawal',
                'details' => "Manually created a " . $request->status . " withdrawal of \${$request->amount} for User ID: {$request->user_id}.",
                'ip_address' => $request->ip()
            ]);
        });

        return back()->with('success', 'Manual withdrawal request created successfully.');
    }

    private function exportCsv($wallets)
    {
        $filename = "wallets_report_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];
        $columns = ['ID', 'User Name', 'User Email', 'Available Balance ($)', 'Last Updated'];

        $callback = function () use ($wallets, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($wallets as $w) {
                fputcsv($file, [
                    $w->id,
                    $w->user->name ?? 'N/A',
                    $w->user->email ?? 'N/A',
                    $w->balance,
                    $w->updated_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }
}
