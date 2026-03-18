<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{
    protected $fillable = [
        'name',
        'email',
        'image_path',
        'status',
    ];

    public function getImageUrlAttribute()
    {
        return $this->image_path 
            ? asset('storage/' . $this->image_path) 
            : 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=F97316&background=FFF7ED';
    }

    protected $appends = ['image_url'];
}
