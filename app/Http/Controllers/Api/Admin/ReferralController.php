<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function __construct(private readonly ReferralService $referralService)
    {
    }

    /**
     * GET /api/admin/referrals
     * 
     * All users with referral stats for the report.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'min_referrals', 'per_page']);
        $report = $this->referralService->getAdminReferralReport($filters);

        $data = $report->through(function ($user) {
            return [
                'id'              => $user->id,
                'name'            => $user->name,
                'email'           => $user->email,
                'referral_code'   => $user->referral_code,
                'status'          => $user->status,
                'total_referrals' => $user->direct_referrals_count,
                'total_earned'    => round($user->total_referral_earned ?? 0, 2),
                'created_at'      => $user->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }

    /**
     * GET /api/admin/referrals/{user_id}
     * 
     * Specific user's full referral tree and earnings.
     */
    public function show(int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $details = $this->referralService->getAdminUserReferralDetails($user);

        return response()->json([
            'status' => 'success',
            'data'   => $details,
        ]);
    }
}
