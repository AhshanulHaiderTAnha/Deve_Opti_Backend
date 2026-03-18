<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'image_path',
        'status',
    ];

    public function details()
    {
        return $this->hasMany(PaymentMethodDetail::class);
    }

    public function getLogoUrlAttribute()
    {
        return $this->image_path 
            ? asset('storage/' . $this->image_path) 
            : null;
    }

    protected $appends = ['logo_url'];
}
