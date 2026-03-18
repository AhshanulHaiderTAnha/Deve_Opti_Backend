<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\KycResource;
use App\Models\KycSubmission;
use App\Services\KycService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KycController extends Controller
{
    public function __construct(private readonly KycService $kycService)
    {
    }

    /**
     * Paginated list of all KYC submissions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = KycSubmission::with(['user', 'reviewer'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->search, fn ($q) => $q->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->latest('updated_at');

        $submissions = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'kyc_submissions' => KycResource::collection($submissions),
            'meta'  => [
                'current_page' => $submissions->currentPage(),
                'last_page'    => $submissions->lastPage(),
                'per_page'     => $submissions->perPage(),
                'total'        => $submissions->total(),
            ],
        ]);
    }

    /**
     * Get a single KYC submission detail.
     */
    public function show(int $id): JsonResponse
    {
        $kyc = KycSubmission::with(['user', 'reviewer'])->findOrFail($id);

        return response()->json([
            'kyc' => new KycResource($kyc),
        ]);
    }

    /**
     * Approve a KYC submission.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $kyc = KycSubmission::findOrFail($id);

        if (! $kyc->isPending()) {
            return response()->json([
                'message' => "KYC is already {$kyc->status}.",
            ], 422);
        }

        $this->kycService->approve($kyc, $request->user());

        return response()->json([
            'message' => 'KYC approved successfully.',
            'kyc'     => new KycResource($kyc->fresh()),
        ]);
    }

    /**
     * Reject a KYC submission.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $kyc = KycSubmission::findOrFail($id);

        if (! $kyc->isPending()) {
            return response()->json([
                'message' => "KYC is already {$kyc->status}.",
            ], 422);
        }

        $this->kycService->reject($kyc, $request->user(), $request->reason);

        return response()->json([
            'message' => 'KYC rejected.',
            'kyc'     => new KycResource($kyc->fresh()),
        ]);
    }
}
