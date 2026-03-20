<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = UserActivityLog::with('user:id,name,email')->latest();
        
        if ($request->search) {
            $query->whereHas('user', function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            })->orWhere('action', 'like', "%{$request->search}%");
        }
        
        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }
    
    public function destroy(UserActivityLog $userActivityLog)
    {
        $userActivityLog->delete();
        return back()->with('success', 'Log entry removed.');
    }

    public function clearOld()
    {
        UserActivityLog::where('created_at', '<', now()->subDays(30))->delete();
        return back()->with('success', 'Logs older than 30 days cleared.');
    }
}
