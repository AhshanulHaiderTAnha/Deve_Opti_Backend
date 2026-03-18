<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\KycSubmission;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $totalUsers   = User::role('user')->count();
        $activeUsers  = User::role('user')->where('status', 'active')->count();
        $pendingKyc   = KycSubmission::where('status', KycSubmission::STATUS_PENDING)->count();
        $approvedKyc  = KycSubmission::where('status', KycSubmission::STATUS_APPROVED)->count();
        $rejectedKyc  = KycSubmission::where('status', KycSubmission::STATUS_REJECTED)->count();
        $noKyc        = User::role('user')->doesntHave('kycSubmission')->count();

        return response()->json([
            'stats' => [
                'total_users'    => $totalUsers,
                'active_users'   => $activeUsers,
                'pending_kyc'    => $pendingKyc,
                'approved_kyc'   => $approvedKyc,
                'rejected_kyc'   => $rejectedKyc,
                'no_kyc'         => $noKyc,
            ],
        ]);
    }
}
