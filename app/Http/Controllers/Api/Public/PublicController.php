<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\SuccessStory;
use App\Models\Faq;
use Illuminate\Support\Facades\Cache;

class PublicController extends Controller
{
    public function successStories()
    {
        $stories = Cache::remember('public_success_stories', 300, function () {
            return SuccessStory::where('status', 'published')
                ->orderBy('position')
                ->limit(8)
                ->get();
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
                ->get();
        });

        return response()->json([
            'status' => 'success',
            'data' => $faqs
        ]);
    }
}
