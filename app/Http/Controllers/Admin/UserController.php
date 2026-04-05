<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    protected function getFilteredUsersQuery(Request $request)
    {
        $query = User::role('user')
            ->with(['kycSubmission', 'roles'])
            ->withSum(['depositRequests as total_deposits' => fn($q) => $q->where('status', 'approved')], 'amount')
            ->withSum(['withdrawalRequests as total_withdrawals' => fn($q) => $q->where('status', 'approved')], 'amount')
            ->withSum(['userTasks as total_commissions' => fn($q) => $q->where('status', 'completed')], 'total_earned_commission');

        $query->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
            $q->where('name', 'like', "%{$request->search}%")
              ->orWhere('email', 'like', "%{$request->search}%");
        }))
        ->when($request->status, fn ($q) => $q->where('status', $request->status))
        ->when($request->kyc_status, fn ($q) => $q->whereHas(
            'kycSubmission', fn ($q) => $q->where('status', $request->kyc_status)
        ))
        ->when($request->date_filter, function ($q) use ($request) {
            if ($request->date_filter === 'today') $q->whereDate('created_at', now()->toDateString());
            if ($request->date_filter === 'last_7_days') $q->where('created_at', '>=', now()->subDays(7));
            if ($request->date_filter === 'last_30_days') $q->where('created_at', '>=', now()->subDays(30));
            if ($request->date_filter === 'this_month') $q->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year);
        });

        if ($request->sort_by === 'highest_earning') {
            $query->orderByDesc('total_commissions');
        } elseif ($request->sort_by === 'highest_deposit') {
            $query->orderByDesc('total_deposits');
        } elseif ($request->sort_by === 'highest_withdrawal') {
            $query->orderByDesc('total_withdrawals');
        } else {
            $query->latest();
        }

        return $query;
    }

    public function index(Request $request): Response
    {
        $users = $this->getFilteredUsersQuery($request)->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users'   => UserResource::collection($users),
            'filters' => $request->only(['search', 'status', 'kyc_status', 'date_filter', 'sort_by']),
        ]);
    }

    public function export(Request $request)
    {
        $users = $this->getFilteredUsersQuery($request)->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=users_export_" . date('Y-m-d_H-i-s') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Name', 'Email', 'Phone', 'Status', 'KYC Status', 'Total Deposits ($)', 'Total Withdrawals ($)', 'Task Earnings ($)', 'Registered Date'];

        $callback = function() use($users, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($users as $user) {
                $row = [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->phone ?? 'N/A',
                    $user->status,
                    $user->kycSubmission?->status ?? 'not_submitted',
                    $user->total_deposits ?? 0,
                    $user->total_withdrawals ?? 0,
                    $user->total_commissions ?? 0,
                    $user->created_at->format('Y-m-d H:i:s'),
                ];
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function searchAjax(Request $request)
    {
        $search = $request->search;
        $users = User::role('user')
            ->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json($users);
    }

    public function show(int $id, Request $request): Response
    {
        $user = User::with(['kycSubmission.reviewer', 'roles', 'wallet'])->findOrFail($id);
        $activities = $user->activities()->latest()->limit(5)->get();

        $deposits = \App\Models\DepositRequest::with(['depositPlan', 'paymentMethod'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(5, ['*'], 'deposits_page')
            ->withQueryString();

        $withdrawals = \App\Models\WithdrawalRequest::where('user_id', $user->id)
            ->latest()
            ->paginate(5, ['*'], 'withdrawals_page')
            ->withQueryString();

        $userTasks = \App\Models\UserTask::with(['orderTask:id,title,required_orders,commission_type'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(5, ['*'], 'tasks_page')
            ->withQueryString();

        $taskStats = [
            'running' => \App\Models\UserTask::where('user_id', $user->id)->where('status', 'in_progress')->count(),
            'completed' => \App\Models\UserTask::where('user_id', $user->id)->where('status', 'completed')->count(),
            'earned_commission' => \App\Models\UserTask::where('user_id', $user->id)->where('status', 'completed')->sum('total_earned_commission'),
        ];

        return Inertia::render('Admin/Users/Show', [
            'user'       => new UserResource($user),
            'wallet'     => $user->wallet,
            'activities' => $activities,
            'deposits'   => $deposits,
            'withdrawals'=> $withdrawals,
            'userTasks'  => $userTasks,
            'taskStats'  => $taskStats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'status'   => ['required', 'in:active,inactive,suspended'],
            'role'     => ['required', 'in:admin,user'],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => bcrypt($validated['password']),
            'status'   => $validated['status'],
        ]);

        $user->assignRole($validated['role']);

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'              => ['required', 'string', 'max:255'],
            'email'             => ['required', 'string', 'email', 'max:255', "unique:users,email,{$id}"],
            'password'          => ['nullable', 'string', 'min:8'],
            'status'            => ['required', 'in:active,inactive,suspended'],
            'role'              => ['required', 'in:admin,user'],
            'withdrawal_enable' => ['boolean'],
        ]);

        $user->update([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'status'            => $validated['status'],
            'withdrawal_enable' => $validated['withdrawal_enable'] ?? true,
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => bcrypt($validated['password'])]);
        }

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'User updated successfully.');
    }

    public function updateKycStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected']
        ]);

        $user = User::findOrFail($id);
        
        // If user already has a submission, update it
        if ($user->kycSubmission) {
            $user->kycSubmission->update([
                'status' => $validated['status'],
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
        } else {
            // Otherwise create a dummy submission to hold the status
            $user->kycSubmission()->create([
                'status' => $validated['status'],
                'full_name' => $user->name,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
        }

        return back()->with('success', "KYC status updated to {$validated['status']}.");
    }

    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate(['status' => ['required', 'in:active,inactive,suspended']]);
        $user = User::findOrFail($id);

        if ($user->hasRole('admin') && $validated['status'] !== 'active') {
            return back()->withErrors(['status' => 'Cannot suspend an administrator.']);
        }

        $user->update(['status' => $validated['status']]);

        return back()->with('success', "User status updated to {$validated['status']}.");
    }
}
