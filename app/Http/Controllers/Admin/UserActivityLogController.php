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

    public function export(Request $request)
    {
        $startDate = $request->start_date ? \Carbon\Carbon::parse($request->start_date) : now()->subDays(15);
        $endDate = $request->end_date ? \Carbon\Carbon::parse($request->end_date) : now();

        if ($startDate->diffInDays($endDate) > 15) {
            return back()->with('error', 'Export date range cannot exceed 15 days.');
        }

        $query = UserActivityLog::with('user:id,name,email')
            ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->latest();

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->whereHas('user', function($u) use ($request) {
                    $u->where('name', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%");
                })->orWhere('action', 'like', "%{$request->search}%");
            });
        }

        $logs = $query->get();

        $filename = "activity_logs_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];
        $columns = ['ID', 'User', 'Action', 'IP Address', 'Date'];

        $callback = function() use($logs, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($logs as $l) {
                fputcsv($file, [
                    $l->id,
                    $l->user ? $l->user->name . ' (' . $l->user->email . ')' : 'System',
                    $l->action,
                    $l->ip_address,
                    $l->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
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
