<?php

namespace App\Services;

use App\Models\DepositRequest;
use App\Models\ReferralEarning;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class ReferralService
{
    /**
     * Commission rates per level.
     */
    const COMMISSION_RATES = [
        1 => 5.00, // Level 1: Direct referral — 5%
        2 => 3.00, // Level 2: Referral's referral — 3%
        3 => 1.00, // Level 3: Third-level referral — 1%
    ];

    /**
     * Link a referrer to a newly registered user.
     */
    public function assignReferrer(User $user, ?string $referralCode): void
    {
        if (empty($referralCode)) {
            return;
        }

        $referrer = User::where('referral_code', $referralCode)
            ->where('id', '!=', $user->id)
            ->first();

        if ($referrer) {
            $user->update(['referred_by' => $referrer->id]);
        }
    }

    /**
     * Distribute commissions up 3 levels when a deposit is approved.
     */
    public function distributeCommissions(DepositRequest $deposit): void
    {
        $depositUser = $deposit->user;
        $currentUser = $depositUser;

        for ($level = 1; $level <= 3; $level++) {
            // Walk up the referral chain
            $referrer = $currentUser->referrer;

            if (!$referrer) {
                break; // No more referrers in the chain
            }

            $rate = self::COMMISSION_RATES[$level];
            $earnedAmount = round(($deposit->amount * $rate) / 100, 2);

            if ($earnedAmount <= 0) {
                $currentUser = $referrer;
                continue;
            }

            // Create earning record
            $earning = ReferralEarning::create([
                'user_id'            => $referrer->id,
                'referred_user_id'   => $depositUser->id,
                'deposit_request_id' => $deposit->id,
                'level'              => $level,
                'commission_rate'    => $rate,
                'deposit_amount'     => $deposit->amount,
                'earned_amount'      => $earnedAmount,
                'status'             => 'credited',
            ]);

            // Credit referrer's wallet
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $referrer->id],
                ['balance' => 0]
            );

            $wallet->balance += $earnedAmount;
            $wallet->save();

            // Record wallet transaction
            WalletTransaction::create([
                'user_id'        => $referrer->id,
                'type'           => 'credit',
                'amount'         => $earnedAmount,
                'balance_after'  => $wallet->balance,
                'reference_type' => 'referral_earnings',
                'reference_id'   => $earning->id,
                'description'    => "Referral commission (Level {$level}) from {$depositUser->name}'s deposit",
            ]);

            // Move up the chain
            $currentUser = $referrer;
        }
    }

    /**
     * Get referral dashboard stats for a user.
     */
    public function getDashboardStats(User $user): array
    {
        $directReferrals = User::where('referred_by', $user->id);
        $totalReferrals = $directReferrals->count();
        $activeReferrals = (clone $directReferrals)->where('status', 'active')->count();
        $pendingReferrals = $totalReferrals - $activeReferrals;

        $totalEarned = ReferralEarning::where('user_id', $user->id)
            ->where('status', 'credited')
            ->sum('earned_amount');

        // Earnings by level
        $earningsByLevel = ReferralEarning::where('user_id', $user->id)
            ->where('status', 'credited')
            ->selectRaw('level, SUM(earned_amount) as total')
            ->groupBy('level')
            ->pluck('total', 'level')
            ->toArray();

        return [
            'total_referrals'   => $totalReferrals,
            'active_referrals'  => $activeReferrals,
            'pending_referrals' => $pendingReferrals,
            'total_earned'      => round($totalEarned, 2),
            'referral_code'     => $user->referral_code,
            'referral_link'     => config('app.frontend_url', config('app.url')) . '/signup?ref=' . $user->referral_code,
            'commission_structure' => [
                ['level' => 1, 'rate' => self::COMMISSION_RATES[1], 'label' => 'Direct referrals'],
                ['level' => 2, 'rate' => self::COMMISSION_RATES[2], 'label' => 'Referrals of your referrals'],
                ['level' => 3, 'rate' => self::COMMISSION_RATES[3], 'label' => 'Third-level referrals'],
            ],
            'earnings_by_level' => [
                'level_1' => round($earningsByLevel[1] ?? 0, 2),
                'level_2' => round($earningsByLevel[2] ?? 0, 2),
                'level_3' => round($earningsByLevel[3] ?? 0, 2),
            ],
        ];
    }

    /**
     * Get paginated list of user's direct referrals (Overview tab).
     */
    public function getMyReferrals(User $user, array $filters = [])
    {
        $query = User::where('referred_by', $user->id)
            ->select('id', 'name', 'email', 'status', 'created_at');

        // Search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('id', $search);
            });
        }

        // Status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $referrals = $query->latest()->paginate($filters['per_page'] ?? 15);

        // Attach deposit order count and commission earned per referral
        $referrals->getCollection()->transform(function ($referral) use ($user) {
            $referral->orders = DepositRequest::where('user_id', $referral->id)
                ->where('status', 'approved')
                ->count();

            $referral->commission = round(
                ReferralEarning::where('user_id', $user->id)
                    ->where('referred_user_id', $referral->id)
                    ->where('status', 'credited')
                    ->sum('earned_amount'),
                2
            );

            $referral->joined = $referral->created_at->format('Y-m-d');

            return $referral;
        });

        return $referrals;
    }

    /**
     * Get referrals deposit & withdrawal data (Deposit & Withdrawal tab).
     */
    public function getMyReferralsDeposits(User $user, array $filters = [])
    {
        $query = User::where('referred_by', $user->id)
            ->select('id', 'name', 'email', 'status', 'created_at');

        // Search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('id', $search);
            });
        }

        // Status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $referrals = $query->latest()->paginate($filters['per_page'] ?? 15);

        $totals = [
            'total_deposits'    => 0,
            'total_withdrawals' => 0,
            'net_deposit'       => 0,
        ];

        $referrals->getCollection()->transform(function ($referral) use (&$totals) {
            $totalDeposit = DepositRequest::where('user_id', $referral->id)
                ->where('status', 'approved')
                ->sum('amount');

            $totalWithdrawal = \App\Models\WithdrawalRequest::where('user_id', $referral->id)
                ->where('status', 'approved')
                ->sum('amount');

            $referral->user_uid = 'USR-' . str_pad($referral->id, 5, '0', STR_PAD_LEFT);
            $referral->total_deposit = round($totalDeposit, 2);
            $referral->total_withdrawal = round($totalWithdrawal, 2);
            $referral->net_deposit = round($totalDeposit - $totalWithdrawal, 2);

            $totals['total_deposits'] += $referral->total_deposit;
            $totals['total_withdrawals'] += $referral->total_withdrawal;
            $totals['net_deposit'] += $referral->net_deposit;

            return $referral;
        });

        $totals['total_deposits'] = round($totals['total_deposits'], 2);
        $totals['total_withdrawals'] = round($totals['total_withdrawals'], 2);
        $totals['net_deposit'] = round($totals['net_deposit'], 2);

        return [
            'referrals' => $referrals,
            'totals'    => $totals,
        ];
    }

    /**
     * Get earning history for a user.
     */
    public function getEarningHistory(User $user, array $filters = [])
    {
        $query = ReferralEarning::where('user_id', $user->id)
            ->with(['referredUser:id,name,email', 'depositRequest:id,amount,created_at']);

        if (!empty($filters['level'])) {
            $query->where('level', $filters['level']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Admin: Get all users with referral stats for the referral report.
     */
    public function getAdminReferralReport(array $filters = [])
    {
        $query = User::role('user')
            ->withCount('directReferrals')
            ->withSum(['referralEarnings as total_referral_earned' => fn($q) => $q->where('status', 'credited')], 'earned_amount')
            ->having('direct_referrals_count', '>', 0);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('referral_code', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['min_referrals'])) {
            $query->having('direct_referrals_count', '>=', $filters['min_referrals']);
        }

        return $query->orderByDesc('direct_referrals_count')
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Admin: Get a specific user's full referral tree and earnings.
     */
    public function getAdminUserReferralDetails(User $user): array
    {
        // Level 1: Direct referrals
        $level1Ids = User::where('referred_by', $user->id)->pluck('id');

        // Level 2: Referrals of Level 1
        $level2Ids = User::whereIn('referred_by', $level1Ids)->pluck('id');

        // Level 3: Referrals of Level 2
        $level3Ids = User::whereIn('referred_by', $level2Ids)->pluck('id');

        $level1Users = User::whereIn('id', $level1Ids)->select('id', 'name', 'email', 'status', 'created_at')->get();
        $level2Users = User::whereIn('id', $level2Ids)->select('id', 'name', 'email', 'status', 'referred_by', 'created_at')->get();
        $level3Users = User::whereIn('id', $level3Ids)->select('id', 'name', 'email', 'status', 'referred_by', 'created_at')->get();

        // Earnings breakdown
        $earningsByLevel = ReferralEarning::where('user_id', $user->id)
            ->where('status', 'credited')
            ->selectRaw('level, SUM(earned_amount) as total, COUNT(*) as count')
            ->groupBy('level')
            ->get()
            ->keyBy('level');

        $totalEarned = ReferralEarning::where('user_id', $user->id)
            ->where('status', 'credited')
            ->sum('earned_amount');

        // Recent earnings
        $recentEarnings = ReferralEarning::where('user_id', $user->id)
            ->with(['referredUser:id,name,email'])
            ->latest()
            ->limit(20)
            ->get();

        return [
            'user' => [
                'id'            => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'referral_code' => $user->referral_code,
                'referred_by'   => $user->referrer?->name,
            ],
            'stats' => [
                'level_1_count'    => $level1Ids->count(),
                'level_2_count'    => $level2Ids->count(),
                'level_3_count'    => $level3Ids->count(),
                'total_referrals'  => $level1Ids->count() + $level2Ids->count() + $level3Ids->count(),
                'total_earned'     => round($totalEarned, 2),
                'level_1_earned'   => round($earningsByLevel[1]->total ?? 0, 2),
                'level_2_earned'   => round($earningsByLevel[2]->total ?? 0, 2),
                'level_3_earned'   => round($earningsByLevel[3]->total ?? 0, 2),
            ],
            'referral_tree' => [
                'level_1' => $level1Users,
                'level_2' => $level2Users,
                'level_3' => $level3Users,
            ],
            'recent_earnings' => $recentEarnings,
        ];
    }
}
