<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WithdrawalRequest;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Mail\WithdrawalApprovedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    public function index(Request $request)
    {
        $query = WithdrawalRequest::with('user')->latest();

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->boolean('export')) {
            return $this->exportCsv($query->get());
        }

        return Inertia::render('Admin/Withdrawals/Index', [
            'withdrawals' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['start_date', 'end_date', 'status'])
        ]);
    }

    public function approve(Request $request, WithdrawalRequest $withdrawal)
    {
        $request->validate([
            'admin_transaction_id' => 'required|string'
        ]);

        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be approved.');
        }

        try {
            DB::transaction(function () use ($withdrawal, $request) {
                $wallet = Wallet::where('user_id', $withdrawal->user_id)->lockForUpdate()->first();
                if (!$wallet || $wallet->balance < $withdrawal->amount) {
                    throw new \Exception('Insufficient balance. The user may have requested another withdrawal or spent their balance.');
                }

                $wallet->balance -= $withdrawal->amount;
                $wallet->save();

                $withdrawal->update([
                    'status' => 'approved',
                    'admin_transaction_id' => $request->admin_transaction_id,
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                ]);

                WalletTransaction::create([
                    'user_id' => $withdrawal->user_id,
                    'type' => 'debit',
                    'amount' => $withdrawal->amount,
                    'balance_after' => $wallet->balance,
                    'reference_type' => 'withdrawal_requests',
                    'reference_id' => $withdrawal->id,
                    'description' => 'Withdrawal approved. Trx: ' . $request->admin_transaction_id,
                ]);
            });

            Mail::to($withdrawal->user->email)->send(new WithdrawalApprovedMail($withdrawal));

            return back()->with('success', 'Withdrawal approved successfully. Balance deducted.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function reject(Request $request, WithdrawalRequest $withdrawal)
    {
        $request->validate([
            'admin_comments' => 'required|string'
        ]);

        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be rejected.');
        }

        $withdrawal->update([
            'status' => 'rejected',
            'admin_comments' => $request->admin_comments,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Withdrawal rejected. No balance was deducted.');
    }

    private function exportCsv($withdrawals)
    {
        $filename = "withdrawals_report_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];
        $columns = ['ID', 'User Email', 'Amount', 'Gateway Info', 'Admin Trx ID', 'Status', 'Date'];

        $callback = function() use($withdrawals, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($withdrawals as $w) {
                fputcsv($file, [
                    $w->id,
                    $w->user->email,
                    $w->amount,
                    $w->payment_gateway_info,
                    $w->admin_transaction_id,
                    $w->status,
                    $w->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }
}
