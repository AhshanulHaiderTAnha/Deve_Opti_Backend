<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentMethod;
use App\Models\PaymentMethodDetail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/PaymentMethods/Index', [
            'methods' => PaymentMethod::with('details')->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
            'status' => 'required|in:active,inactive',
            'details' => 'array',
            'details.*.label' => 'required|string|max:255',
            'details.*.value' => 'required|string',
            'details.*.note' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('payment-methods', 'public');
        }

        $method = PaymentMethod::create($validated);

        if (!empty($request->details)) {
            foreach ($request->details as $detail) {
                $method->details()->create($detail);
            }
        }

        return back()->with('success', 'Payment method created successfully.');
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
            'status' => 'required|in:active,inactive',
            'details' => 'array',
            'details.*.label' => 'required|string|max:255',
            'details.*.value' => 'required|string',
            'details.*.note' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            if ($paymentMethod->image_path) {
                Storage::disk('public')->delete($paymentMethod->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('payment-methods', 'public');
        }

        $paymentMethod->update($validated);

        // Simple sync for details: delete old, create new
        $paymentMethod->details()->delete();
        if (!empty($request->details)) {
            foreach ($request->details as $detail) {
                $paymentMethod->details()->create($detail);
            }
        }

        return back()->with('success', 'Payment method updated successfully.');
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        if ($paymentMethod->image_path) {
            Storage::disk('public')->delete($paymentMethod->image_path);
        }

        $paymentMethod->delete();

        return back()->with('success', 'Payment method deleted successfully.');
    }
}
