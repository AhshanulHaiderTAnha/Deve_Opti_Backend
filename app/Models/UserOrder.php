<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserOrder extends Model
{
    protected $fillable = [
        'user_task_id',
        'product_id',
        'order_price',
        'commission_amount',
        'status',
    ];

    public function userTask()
    {
        return $this->belongsTo(UserTask::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
