<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommissionTierBenefit extends Model
{
    protected $fillable = ['commission_tier_id', 'benefit', 'is_enabled'];
}
