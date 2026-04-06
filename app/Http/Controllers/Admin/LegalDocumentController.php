<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LegalDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LegalDocumentController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type', 'terms');
        
        $documents = LegalDocument::where('type', $type)
            ->orderBy('position')
            ->get();

        return Inertia::render('Admin/LegalDocuments/Index', [
            'documents' => $documents,
            'currentType' => $type,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:terms,privacy,cookies',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'position' => 'nullable|integer',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        
        LegalDocument::create($validated);
        
        $this->clearCache($validated['type']);

        return back()->with('success', 'Document section created successfully.');
    }

    public function update(Request $request, $id)
    {
        $document = LegalDocument::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'position' => 'nullable|integer',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        
        $document->update($validated);
        
        $this->clearCache($document->type);

        return back()->with('success', 'Document section updated successfully.');
    }

    public function destroy($id)
    {
        $document = LegalDocument::findOrFail($id);
        $type = $document->type;
        $document->delete();
        
        $this->clearCache($type);

        return back()->with('success', 'Document section deleted successfully.');
    }

    private function clearCache($type)
    {
        Cache::forget("public_legal_{$type}");
    }
}
