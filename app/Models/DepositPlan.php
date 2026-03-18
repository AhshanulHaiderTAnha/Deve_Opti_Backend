<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepositPlan extends Model
{
    protected $fillable = [
        'name', 'slug', 
        'duration', 'duration_type', 
        'image_path', 'status'
    ];

    protected $appends = ['image_url'];

    public function benefits()
    {
        return $this->hasMany(DepositPlanBenefit::class);
    }

    public function levels()
    {
        return $this->hasMany(DepositPlanLevel::class);
    }

    public function getImageUrlAttribute()
    {
        return $this->image_path ? asset('storage/' . $this->image_path) : null;
    }
}
