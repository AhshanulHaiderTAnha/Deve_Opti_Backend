<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReferralEarning;
use App\Models\User;
use App\Services\ReferralService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends Controller
{
    public function __construct(private readonly ReferralService $referralService)
    {
    }

    /**
     * Referral Report — paginated list of all users with referral activity.
     */
    public function index(Request $request): Response
    {
        $query = User::role('user')
            ->select('users.*')
            ->with(['referrer'])
            ->withCount('directReferrals')
            ->withSum(['referralEarnings as total_referral_earned' => fn($q) => $q->where('status', 'credited')], 'earned_amount');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('referral_code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('min_referrals')) {
            $query->having('direct_referrals_count', '>=', $request->min_referrals);
        }

        // Global stats
        $totalReferralEarnings = ReferralEarning::where('status', 'credited')->sum('earned_amount');
        $totalReferralLinks = User::role('user')->whereNotNull('referred_by')->count();
        $totalActiveReferrers = User::role('user')->has('directReferrals')->count();

        if ($request->boolean('export')) {
            return $this->exportCsv($query->orderByDesc('direct_referrals_count')->get());
        }

        $users = $query->orderByDesc('direct_referrals_count')
            ->paginate($request->input('per_page', 15))
            ->withQueryString();

        return Inertia::render('Admin/Referrals/Index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'min_referrals']),
            'globalStats' => [
                'total_referral_earnings' => round($totalReferralEarnings, 2),
                'total_referred_users'    => $totalReferralLinks,
                'total_active_referrers'  => $totalActiveReferrers,
            ],
        ]);
    }

    /**
     * User Referral Detail — referral tree and earnings.
     */
    public function show(int $userId): Response
    {
        $user = User::findOrFail($userId);
        $details = $this->referralService->getAdminUserReferralDetails($user);
        $performance = $this->referralService->getAgentTeamPerformance($user);

        // Paginated earnings
        $earnings = ReferralEarning::where('user_id', $userId)
            ->with(['referredUser:id,name,email', 'depositRequest:id,amount,created_at'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Referrals/Show', [
            'referralData' => $details,
            'performance'  => $performance['team_performance'],
            'earnings'     => $earnings,
        ]);
    }

    /**
     * CSV Export.
     */
    private function exportCsv($users)
    {
        $filename = "referral_report_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Name', 'Email', 'Referral Code', 'Referrer Name', 'Referrer Email', 'Direct Referrals', 'Total Earned ($)', 'Status', 'Joined'];

        $callback = function() use($users, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->referral_code,
                    $user->referrer?->name ?? 'N/A',
                    $user->referrer?->email ?? 'N/A',
                    $user->direct_referrals_count,
                    round($user->total_referral_earned ?? 0, 2),
                    $user->status,
                    $user->created_at->format('Y-m-d'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
