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
