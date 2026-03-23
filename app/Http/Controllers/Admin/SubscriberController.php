<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriberController extends Controller
{
    public function index(Request $request)
    {
        $query = Subscriber::query();

        if ($request->filled('search')) {
            $query->where('email', 'like', "%{$request->search}%");
        }

        return Inertia::render('Admin/Subscribers/Index', [
            'subscribers' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function export(Request $request)
    {
        $query = Subscriber::query();

        if ($request->filled('search')) {
            $query->where('email', 'like', "%{$request->search}%");
        }

        $subscribers = $query->latest()->get();

        $filename = "subscribers_export_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];
        $columns = ['ID', 'Email', 'Subscribed At'];

        $callback = function() use($subscribers, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($subscribers as $s) {
                fputcsv($file, [
                    $s->id,
                    $s->email,
                    $s->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }

    public function destroy(Subscriber $subscriber)
    {
        $subscriber->delete();
        return back()->with('success', 'Subscriber deleted successfully.');
    }
}
