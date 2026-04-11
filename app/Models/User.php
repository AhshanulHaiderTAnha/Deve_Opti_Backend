<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Str;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     */
    protected $appends = [
        'role',
        'profile_image_url',
    ];
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'status',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'email_verified_at',
        'profile_image_path',
        'referral_code',
        'referred_by',
        'withdrawal_enable',
        'google_id',
        'google_avatar',
    ];

    /**
     * Auto-generate a unique referral code when creating a new user.
     */
    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->referral_code)) {
                $user->referral_code = static::generateUniqueReferralCode();
            }
        });
    }

    /**
     * Generate a unique referral code in REF-XXXXXXXX format.
     */
    public static function generateUniqueReferralCode(): string
    {
        do {
            $code = 'REF-' . strtoupper(Str::random(8));
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Get the profile image URL.
     */
    protected function profileImageUrl(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->profile_image_path 
                ? asset('storage/' . $this->profile_image_path) 
                : asset('assets/images/default-avatar.png'),
        );
    }

    /**
     * Get the user's first role (Legacy accessor to avoid conflict with Spatie's role scope).
     */
    public function getRoleAttribute()
    {
        return $this->roles->first()?->name;
    }

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'      => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'password'               => 'hashed',
            'withdrawal_enable'      => 'boolean',
        ];
    }

    // Relationships
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function deposits()
    {
        return $this->hasMany(Deposit::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    // Referral Relationships
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function directReferrals()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    public function referralEarnings()
    {
        return $this->hasMany(ReferralEarning::class);
    }

    public function kycSubmission()
    {
        return $this->hasOne(KycSubmission::class);
    }

    public function activities()
    {
        return $this->hasMany(UserActivity::class);
    }

    public function depositRequests()
    {
        return $this->hasMany(DepositRequest::class);
    }

    public function withdrawalRequests()
    {
        return $this->hasMany(WithdrawalRequest::class);
    }

    public function withdrawalPassword()
    {
        return $this->hasOne(UserWithdrawalPassword::class);
    }

    public function userTasks()
    {
        return $this->hasMany(UserTask::class);
    }

    // Helpers
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function hasTwoFactorEnabled(): bool
    {
        return ! is_null($this->two_factor_confirmed_at);
    }
}
