<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepositPlanBenefit extends Model
{
    protected $fillable = ['deposit_plan_id', 'benefit_text', 'status'];

    public function plan()
    {
        return $this->belongsTo(DepositPlan::class, 'deposit_plan_id');
    }
}
