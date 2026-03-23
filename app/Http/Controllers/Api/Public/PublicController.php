<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\SuccessStory;
use App\Models\Faq;
use App\Models\Subscriber;
use App\Mail\SubscriptionConfirmationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class PublicController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:subscribers,email'
        ]);

        $subscriber = Subscriber::create([
            'email' => $request->email
        ]);

        // Send confirmation email
        Mail::to($subscriber->email)->send(new SubscriptionConfirmationMail($subscriber->email));

        return response()->json([
            'status' => 'success',
            'message' => 'Thank you for subscribing! A confirmation email has been sent.'
        ]);
    }
    public function successStories()
    {
        $stories = Cache::remember('public_success_stories', 300, function () {
            return SuccessStory::where('status', 'published')
                ->orderBy('position')
                ->limit(8)
                ->get()
                ->toArray();
        });

        return response()->json([
            'status' => 'success',
            'data' => $stories
        ]);
    }

    public function faqs()
    {
        $faqs = Cache::remember('public_faqs', 300, function () {
            return Faq::where('status', 'published')
                ->orderBy('position')
                ->limit(15)
                ->get()
                ->toArray();
        });
 
        return response()->json([
            'status' => 'success',
            'data' => $faqs
        ]);
    }

    public function settings()
    {
        $settings = Cache::remember('public_site_settings', 3600, function () {
            $keys = [
                'system_name',
                'site_logo',
                'site_favicon',
                'google_analytics_id',
                'meta_title',
                'meta_description',
                'meta_keywords'
            ];
            
            $data = \App\Models\Setting::whereIn('key', $keys)->pluck('value', 'key')->toArray();

            // Format image URLs
            if (isset($data['site_logo']) && !str_starts_with($data['site_logo'], 'http')) {
                $data['site_logo'] = asset('storage/' . ltrim($data['site_logo'], '/'));
            }
            if (isset($data['site_favicon']) && !str_starts_with($data['site_favicon'], 'http')) {
                $data['site_favicon'] = asset('storage/' . ltrim($data['site_favicon'], '/'));
            }

            return $data;
        });

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }
}
