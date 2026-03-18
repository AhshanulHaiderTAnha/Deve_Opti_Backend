<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Seller;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SellerController extends Controller
{
    public function index(Request $request)
    {
        $query = Seller::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('Admin/Sellers/Index', [
            'sellers' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:sellers,email',
            'image' => 'nullable|image|max:2048',
            'status' => 'required|in:active,inactive',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('sellers', 'public');
        }

        Seller::create($validated);

        return back()->with('success', 'Seller created successfully.');
    }

    public function update(Request $request, Seller $seller)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:sellers,email,' . $seller->id,
            'image' => 'nullable|image|max:2048',
            'status' => 'required|in:active,inactive',
        ]);

        if ($request->hasFile('image')) {
            if ($seller->image_path) {
                Storage::disk('public')->delete($seller->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('sellers', 'public');
        }

        $seller->update($validated);

        return back()->with('success', 'Seller updated successfully.');
    }

    public function destroy(Seller $seller)
    {
        if ($seller->image_path) {
            Storage::disk('public')->delete($seller->image_path);
        }

        $seller->delete();

        return back()->with('success', 'Seller deleted successfully.');
    }
}
