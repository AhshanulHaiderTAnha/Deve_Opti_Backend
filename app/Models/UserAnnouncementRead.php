<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAnnouncementRead extends Model
{
    protected $fillable = ['user_id', 'announcement_id', 'read_at'];
}
