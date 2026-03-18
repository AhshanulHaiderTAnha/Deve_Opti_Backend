<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(): Response
    {
        $settings = Setting::all()->groupBy('group');

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $settings = $request->except(['_token', '_method']);

        foreach ($settings as $key => $value) {
            $setting = Setting::where('key', $key)->first();

            if (!$setting) continue;

            if ($request->hasFile($key)) {
                $path = $request->file($key)->store('assets/branding', 'public');
                $value = '/' . $path;
            }

            $setting->update(['value' => $value]);
        }

        return back()->with('success', 'Settings updated successfully.');
    }
}
