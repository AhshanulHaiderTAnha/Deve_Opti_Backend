<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'platform',
        'product_url',
        'target_keyword',
        'price',
        'compare_at_price',
        'sku',
        'stock_quantity',
        'description',
        'image_path',
        'status',
    ];

    public function getImageUrlAttribute()
    {
        return $this->image_path 
            ? asset('storage/' . $this->image_path) 
            : null;
    }

    protected $appends = ['image_url'];
}
