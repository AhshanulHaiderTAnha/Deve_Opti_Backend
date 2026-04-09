<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Blog;
use App\Http\Resources\BlogResource;
use Illuminate\Http\JsonResponse;

class BlogController extends Controller
{
    /**
     * Get a paginated list of published blogs.
     */
    public function index(Request $request): JsonResponse
    {
        $blogs = Blog::with('author')
            ->where('status', 'published')
            ->latest()
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'blogs' => BlogResource::collection($blogs),
            'meta'  => [
                'current_page' => $blogs->currentPage(),
                'last_page'    => $blogs->lastPage(),
                'per_page'     => $blogs->perPage(),
                'total'        => $blogs->total(),
            ],
        ]);
    }

    /**
     * Get a single blog post by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $blog = Blog::with('author')
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json([
            'blog' => new BlogResource($blog),
        ]);
    }
}
