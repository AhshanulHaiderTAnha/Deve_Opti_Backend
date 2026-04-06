<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegalDocument extends Model
{
    protected $fillable = [
        'type',
        'title',
        'slug',
        'content',
        'position',
        'status',
    ];
}
