<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KycSubmission;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

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

        return Inertia::render('Admin/Dashboard', compact('stats', 'recentActivity'));
    }
}
