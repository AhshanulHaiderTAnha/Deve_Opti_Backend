<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\UserActivityLog;

class ActivityLogController extends Controller
{
    public function index()
    {
        $logs = UserActivityLog::where('user_id', auth()->id())
            ->latest()
            ->paginate(20);
            
        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }
}
