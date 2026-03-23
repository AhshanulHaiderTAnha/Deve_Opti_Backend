<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KycSubmission;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\DepositRequest;
use App\Models\WithdrawalRequest;
use App\Models\SupportTicket;
use App\Models\Product;
use App\Models\Seller;
use App\Models\UserTask;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total_users'  => User::role('user')->count(),
            'active_users' => User::role('user')->where('status', 'active')->count(),
            'pending_kyc'  => KycSubmission::where('status', KycSubmission::STATUS_PENDING)->count(),
            'approved_kyc' => KycSubmission::where('status', KycSubmission::STATUS_APPROVED)->count(),
            'rejected_kyc' => KycSubmission::where('status', KycSubmission::STATUS_REJECTED)->count(),
            'no_kyc'       => User::role('user')->doesntHave('kycSubmission')->count(),
            'total_deposits' => DepositRequest::where('status', 'approved')->sum('amount'),
            'total_withdrawals' => WithdrawalRequest::where('status', 'approved')->sum('amount'),
            'this_month_deposits'    => DepositRequest::where('status', 'approved')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('amount'),
            'this_month_withdrawals' => WithdrawalRequest::where('status', 'approved')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('amount'),
            'pending_deposits_count' => DepositRequest::where('status', 'pending')->count(),
            'pending_withdrawals_count' => WithdrawalRequest::where('status', 'pending')->count(),
            'total_support_tickets' => SupportTicket::count(),
            'pending_support_tickets' => SupportTicket::where('status', 'open')->count(),
            'total_products' => Product::count(),
            'total_sellers' => Seller::count(),
            'running_tasks' => UserTask::where('status', 'in_progress')->count(),
            'completed_tasks' => UserTask::where('status', 'completed')->count(),
            'today_running_tasks' => UserTask::where('status', 'in_progress')->whereDate('created_at', today())->count(),
            'today_completed_tasks' => UserTask::where('status', 'completed')->whereDate('updated_at', today())->count(),
            'weekly_running_tasks' => UserTask::where('status', 'in_progress')->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'weekly_completed_tasks' => UserTask::where('status', 'completed')->whereBetween('updated_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'monthly_running_tasks' => UserTask::where('status', 'in_progress')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
            'monthly_completed_tasks' => UserTask::where('status', 'completed')->whereMonth('updated_at', now()->month)->whereYear('updated_at', now()->year)->count(),
            'today_commission' => UserTask::where('status', 'completed')->whereDate('updated_at', today())->sum('total_earned_commission'),
        ];

        $recentActivity = KycSubmission::with('user')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($k) => [
                'id'         => $k->id,
                'user_name'  => $k->user->name,
                'user_email' => $k->user->email,
                'status'     => $k->status,
                'submitted'  => $k->created_at->diffForHumans(),
            ]);

        $recentDeposits = DepositRequest::with('user')
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($d) => [
                'id'         => $d->id,
                'user_name'  => $d->user->name,
                'amount'     => $d->amount,
                'submitted'  => $d->created_at->diffForHumans(),
            ]);

        $recentWithdrawals = WithdrawalRequest::with('user')
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($w) => [
                'id'         => $w->id,
                'user_name'  => $w->user->name,
                'amount'     => $w->amount,
                'submitted'  => $w->created_at->diffForHumans(),
            ]);

        $recentPendingTasks = UserTask::with(['user:id,name,email', 'orderTask:id,title,required_orders'])
            ->where('status', 'in_progress')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($t) => [
                'id'         => $t->id,
                'user_name'  => $t->user->name,
                'user_email' => $t->user->email,
                'task_name'  => $t->orderTask->title,
                'progress'   => "{$t->completed_orders} / {$t->orderTask->required_orders}",
                'submitted'  => $t->created_at->diffForHumans(),
            ]);

        $recentCompletedTasks = UserTask::with(['user:id,name,email', 'orderTask:id,title'])
            ->where('status', 'completed')
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(fn ($t) => [
                'id'         => $t->id,
                'user_name'  => $t->user->name,
                'user_email' => $t->user->email,
                'task_name'  => $t->orderTask->title,
                'commission' => $t->total_earned_commission,
                'submitted'  => $t->updated_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/Dashboard', compact('stats', 'recentActivity', 'recentDeposits', 'recentWithdrawals', 'recentPendingTasks', 'recentCompletedTasks'));
    }
}
