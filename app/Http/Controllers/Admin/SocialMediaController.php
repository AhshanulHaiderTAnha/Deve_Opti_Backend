<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\SocialMedia;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SocialMediaController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SocialMedia/Index', [
            'socialMedia' => SocialMedia::orderBy('position')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url|max:255',
            'icon' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',
            'position' => 'required|integer'
        ]);

        SocialMedia::create($request->all());

        return back()->with('success', 'Social media added successfully.');
    }

    public function update(Request $request, SocialMedia $socialMedia)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url|max:255',
            'icon' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',
            'position' => 'required|integer'
        ]);

        $socialMedia->update($request->all());

        return back()->with('success', 'Social media updated successfully.');
    }

    public function destroy(SocialMedia $socialMedia)
    {
        $socialMedia->delete();
        return back()->with('success', 'Social media deleted successfully.');
    }
}
