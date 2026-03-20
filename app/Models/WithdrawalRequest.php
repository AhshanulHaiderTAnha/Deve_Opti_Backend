<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WithdrawalRequest extends Model
{
    protected $fillable = [
        'user_id', 'amount', 'payment_gateway_info', 'admin_transaction_id',
        'admin_comments', 'status', 'reviewed_by', 'reviewed_at'
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewed_by'); }
}
