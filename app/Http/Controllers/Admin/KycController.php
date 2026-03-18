<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\KycResource;
use App\Models\KycSubmission;
use App\Services\KycService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KycController extends Controller
{
    public function __construct(private readonly KycService $kycService)
    {
    }

    public function index(Request $request): Response
    {
        $submissions = KycSubmission::with(['user', 'reviewer'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->search, fn ($q) => $q->whereHas('user', fn ($q) => $q
                ->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%")
            ))
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Kyc/Index', [
            'submissions' => KycResource::collection($submissions),
            'filters'     => $request->only(['status', 'search']),
        ]);
    }

    public function show(int $id): Response
    {
        $kyc = KycSubmission::with(['user', 'reviewer'])->findOrFail($id);

        return Inertia::render('Admin/Kyc/Show', [
            'kyc' => new KycResource($kyc),
        ]);
    }

    public function approve(Request $request, int $id)
    {
        $kyc = KycSubmission::findOrFail($id);

        if (! $kyc->isPending()) {
            return back()->withErrors(['kyc' => "KYC is already {$kyc->status}."]);
        }

        $this->kycService->approve($kyc, $request->user());

        return back()->with('success', 'KYC approved successfully.');
    }

    public function reject(Request $request, int $id)
    {
        $request->validate(['reason' => ['required', 'string', 'max:1000']]);

        $kyc = KycSubmission::findOrFail($id);

        if (! $kyc->isPending()) {
            return back()->withErrors(['kyc' => "KYC is already {$kyc->status}."]);
        }

        $this->kycService->reject($kyc, $request->user(), $request->reason);

        return back()->with('success', 'KYC rejected.');
    }
}
