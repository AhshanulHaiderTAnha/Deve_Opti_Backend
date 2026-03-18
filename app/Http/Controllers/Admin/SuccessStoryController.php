<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SuccessStory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SuccessStoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SuccessStories/Index', [
            'stories' => SuccessStory::orderBy('position')->paginate(15)
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'nullable|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'total_earned' => 'nullable|string',
            'time_period' => 'nullable|string',
            'status' => 'required|in:published,inactive',
            'position' => 'required|integer'
        ]);

        $data = $request->except('image');
        
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('success_stories', 'public');
        }

        SuccessStory::create($data);

        return back()->with('success', 'Success story created successfully.');
    }

    public function update(Request $request, SuccessStory $successStory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'nullable|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'total_earned' => 'nullable|string',
            'time_period' => 'nullable|string',
            'status' => 'required|in:published,inactive',
            'position' => 'required|integer'
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            if ($successStory->image_path) {
                Storage::disk('public')->delete($successStory->image_path);
            }
            $data['image_path'] = $request->file('image')->store('success_stories', 'public');
        }

        $successStory->update($data);

        return back()->with('success', 'Success story updated successfully.');
    }

    public function destroy(SuccessStory $successStory)
    {
        if ($successStory->image_path) {
            Storage::disk('public')->delete($successStory->image_path);
        }
        $successStory->delete();
        return back()->with('success', 'Success story deleted successfully.');
    }
}
