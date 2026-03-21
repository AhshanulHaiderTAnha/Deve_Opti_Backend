<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserTask extends Model
{
    protected $fillable = [
        'user_id',
        'order_task_id',
        'status',
        'completed_orders',
        'total_earned_commission',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderTask()
    {
        return $this->belongsTo(OrderTask::class);
    }

    public function orders()
    {
        return $this->hasMany(UserOrder::class);
    }
}
