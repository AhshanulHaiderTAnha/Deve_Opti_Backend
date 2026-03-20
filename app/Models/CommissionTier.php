<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommissionTier extends Model
{
    protected $fillable = ['name', 'min_amount', 'max_amount', 'commission_rate', 'description', 'icon', 'status', 'sort_order'];

    public function benefits()
    {
        return $this->hasMany(CommissionTierBenefit::class);
    }
}
