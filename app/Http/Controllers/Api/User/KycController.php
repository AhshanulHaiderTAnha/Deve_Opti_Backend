<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\KycSubmitRequest;
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
     * Submit or re-submit KYC information.
     */
    public function submit(KycSubmitRequest $request): JsonResponse
    {
        $user = $request->user();
        $existing = $user->kycSubmission;

        // Prevent re-submission if already approved
        if ($existing && $existing->isApproved()) {
            return response()->json([
                'message' => 'Your KYC has already been approved.',
                'kyc'     => new KycResource($existing),
            ], 422);
        }

        // Delete old files if re-submitting after rejection
        if ($existing && $existing->isRejected()) {
            $this->kycService->deleteFiles($existing);
        }

        $kyc = $this->kycService->submit(
            $user,
            $request->validated(),
            $request->file('id_document'),
            $request->file('selfie')
        );

        \App\Models\UserActivityLog::create([
            'user_id' => $user->id,
            'action' => 'KYC Verification Submitted',
            'details' => "User submitted KYC verification data",
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'message' => 'KYC submitted successfully. Pending admin review.',
            'kyc'     => new KycResource($kyc),
        ], 201);
    }

    /**
     * Get the current user's KYC status.
     */
    public function status(Request $request): JsonResponse
    {
        $kyc = $request->user()->kycSubmission;

        if (! $kyc) {
            return response()->json([
                'status'  => 'not_submitted',
                'message' => 'No KYC submission found.',
                'kyc'     => null,
            ]);
        }

        return response()->json([
            'status' => $kyc->status,
            'kyc'    => new KycResource($kyc),
        ]);
    }
}
