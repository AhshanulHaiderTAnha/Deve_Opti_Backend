<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DepositRequest;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Mail\DepositApprovedMail;
use App\Mail\DepositRejectedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use App\Services\ReferralService;

class DepositController extends Controller
{
    public function index(Request $request)
    {
        $query = DepositRequest::with(['user', 'depositPlan', 'paymentMethod'])->latest();

        if ($request->filled('search')) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            })->orWhere('transaction_id', 'like', "%{$request->search}%");
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->start_date . ' 00:00:00', $request->end_date . ' 23:59:59']);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->boolean('export')) {
            return $this->exportCsv($query->get());
        }

        return Inertia::render('Admin/Deposits/Index', [
            'deposits' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'start_date', 'end_date', 'status'])
        ]);
    }

    public function approve(Request $request, DepositRequest $deposit)
    {
        if ($deposit->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be approved.');
        }

        DB::transaction(function () use ($deposit) {
            $deposit->update([
                'status' => 'approved',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            $wallet = Wallet::firstOrCreate(
                ['user_id' => $deposit->user_id],
                ['balance' => 0]
            );

            $wallet->balance += $deposit->amount;
            $wallet->save();

            WalletTransaction::create([
                'user_id' => $deposit->user_id,
                'type' => 'credit',
                'amount' => $deposit->amount,
                'balance_after' => $wallet->balance,
                'reference_type' => 'deposit_requests',
                'reference_id' => $deposit->id,
                'description' => 'Deposit approved for plan: ' . ($deposit->depositPlan->name ?? 'Custom'),
            ]);

            // Distribute referral commissions (3-level MLM)
            (new ReferralService())->distributeCommissions($deposit);
        });

        Mail::to($deposit->user->email)->send(new DepositApprovedMail($deposit));

        return back()->with('success', 'Deposit approved successfully.');
    }

    public function reject(Request $request, DepositRequest $deposit)
    {
        $request->validate([
            'admin_comments' => 'required|string'
        ]);

        if ($deposit->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be rejected.');
        }

        $deposit->update([
            'status' => 'rejected',
            'admin_comments' => $request->admin_comments,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        Mail::to($deposit->user->email)->send(new DepositRejectedMail($deposit));

        return back()->with('success', 'Deposit rejected.');
    }

    private function exportCsv($deposits)
    {
        $filename = "deposits_report_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];
        $columns = ['ID', 'User Email', 'Plan', 'Method', 'Amount', 'Trx ID', 'Status', 'Date'];

        $callback = function() use($deposits, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($deposits as $d) {
                fputcsv($file, [
                    $d->id,
                    $d->user->email,
                    $d->depositPlan->name ?? 'N/A',
                    $d->paymentMethod->name ?? 'N/A',
                    $d->amount,
                    $d->transaction_id,
                    $d->status,
                    $d->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }
}
