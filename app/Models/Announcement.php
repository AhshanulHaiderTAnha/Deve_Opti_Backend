<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['title', 'content', 'type', 'is_pinned', 'status'];
    
    public function reads()
    {
        return $this->hasMany(UserAnnouncementRead::class);
    }
}
