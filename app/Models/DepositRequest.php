<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepositRequest extends Model
{
    protected $fillable = [
        'user_id', 'deposit_plan_id', 'payment_method_id', 'amount',
        'transaction_id', 'screenshot_path', 'comments', 'admin_comments',
        'status', 'reviewed_by', 'reviewed_at'
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function depositPlan() { return $this->belongsTo(DepositPlan::class); }
    public function paymentMethod() { return $this->belongsTo(PaymentMethod::class); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewed_by'); }
}
