<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function __construct(private readonly ReferralService $referralService)
    {
    }

    /**
     * GET /api/user/referral/dashboard
     * 
     * Returns referral stats, link, code, and commission structure.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $stats = $this->referralService->getDashboardStats($request->user());

        return response()->json([
            'status' => 'success',
            'data'   => $stats,
        ]);
    }

    /**
     * GET /api/user/referral/my-referrals
     * 
     * Paginated list of direct referrals with overview data.
     * Filters: ?search=, ?status=, ?per_page=
     */
    public function myReferrals(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'per_page']);
        $referrals = $this->referralService->getMyReferrals($request->user(), $filters);

        return response()->json([
            'status' => 'success',
            'data'   => $referrals,
        ]);
    }

    /**
     * GET /api/user/referral/my-referrals/deposits
     * 
     * Referral deposit & withdrawal tracking data.
     * Filters: ?search=, ?status=, ?per_page=
    */

    public function myReferralsDeposits(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'per_page']);
        $data = $this->referralService->getMyReferralsDeposits($request->user(), $filters);

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }

    /**
     * GET /api/user/referral/earnings
     * 
     * Paginated earning history.
     * Filters: ?level=, ?per_page=
    */
    
    public function earnings(Request $request): JsonResponse
    {
        $filters = $request->only(['level', 'per_page']);
        $earnings = $this->referralService->getEarningHistory($request->user(), $filters);

        return response()->json([
            'status' => 'success',
            'data'   => $earnings,
        ]);
    }

    /**
     * GET /api/user/referral/team-income
     * 
     * Returns a breakdown of income generated from each member in the 3-level team.
     */
    public function teamIncome(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page']);
        $teamIncome = $this->referralService->getMyTeamIncome($request->user(), $filters);

        return response()->json([
            'status' => 'success',
            'data'   => $teamIncome,
        ]);
    }
}
