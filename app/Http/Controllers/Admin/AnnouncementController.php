<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::query();
        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }
        
        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $query->latest()->paginate(10)->withQueryString(),
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

        $query = Announcement::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])->latest();
        
        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        $announcements = $query->get();

        $filename = "announcements_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];
        $columns = ['ID', 'Title', 'Type', 'Status', 'Pinned', 'Created At'];

        $callback = function() use($announcements, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($announcements as $a) {
                fputcsv($file, [
                    $a->id,
                    $a->title,
                    $a->type,
                    $a->status,
                    $a->is_pinned ? 'Yes' : 'No',
                    $a->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:update,maintenance,promotion,news,alert',
            'is_pinned' => 'boolean',
            'status' => 'required|in:published,draft',
        ]);

        Announcement::create($validated);
        return back()->with('success', 'Announcement created successfully.');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:update,maintenance,promotion,news,alert',
            'is_pinned' => 'boolean',
            'status' => 'required|in:published,draft',
        ]);

        $announcement->update($validated);
        return back()->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return back()->with('success', 'Announcement deleted successfully.');
    }
}
