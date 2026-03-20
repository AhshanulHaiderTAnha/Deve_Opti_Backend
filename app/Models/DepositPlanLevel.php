<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepositPlanLevel extends Model
{
    protected $fillable = ['deposit_plan_id', 'amount', 'profit_value', 'profit_type', 'status'];

    public function plan()
    {
        return $this->belongsTo(DepositPlan::class, 'deposit_plan_id');
    }
}
