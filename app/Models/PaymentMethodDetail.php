<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethodDetail extends Model
{
    protected $fillable = [
        'payment_method_id',
        'label',
        'value',
        'note',
        'status',
    ];

    public function method()
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }
}
