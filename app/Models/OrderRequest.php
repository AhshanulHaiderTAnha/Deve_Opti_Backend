<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderRequest extends Model
{
    protected $fillable = [
        'user_id',
        'order_request_data',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
