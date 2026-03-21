<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderTask extends Model
{
    protected $fillable = [
        'title',
        'commission_type',
        'commission_tier_id',
        'manual_commission_percent',
        'required_orders',
        'status',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_task_products');
    }

    public function tier()
    {
        return $this->belongsTo(CommissionTier::class, 'commission_tier_id');
    }
}
