<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralEarning extends Model
{
    protected $fillable = [
        'user_id',
        'referred_user_id',
        'deposit_request_id',
        'level',
        'commission_rate',
        'deposit_amount',
        'earned_amount',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'level'           => 'integer',
            'commission_rate' => 'decimal:2',
            'deposit_amount'  => 'decimal:2',
            'earned_amount'   => 'decimal:2',
        ];
    }

    // The user who earned the commission
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // The referred user whose deposit triggered the commission
    public function referredUser()
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }

    // The deposit that triggered this earning
    public function depositRequest()
    {
        return $this->belongsTo(DepositRequest::class);
    }
}
