<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Seller;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SellerController extends Controller
{
    protected function getFilteredSellersQuery(Request $request)
    {
        $query = Seller::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        return $query;
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/Sellers/Index', [
            'sellers' => $this->getFilteredSellersQuery($request)->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function export(Request $request)
    {
        $sellers = $this->getFilteredSellersQuery($request)->latest()->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=sellers_export_" . date('Y-m-d_H-i-s') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Name', 'Email', 'Status', 'Registered Date'];

        $callback = function() use($sellers, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($sellers as $seller) {
                fputcsv($file, [
                    $seller->id,
                    $seller->name,
                    $seller->email,
                    $seller->status,
                    $seller->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
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
