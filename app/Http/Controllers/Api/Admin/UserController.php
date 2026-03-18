<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Paginated list of all users with KYC status.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::role('user')
            ->with(['kycSubmission', 'roles'])
            ->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->kyc_status, fn ($q) => $q->whereHas(
                'kycSubmission',
                fn ($q) => $q->where('status', $request->kyc_status)
            ))
            ->latest();

        $users = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'users' => UserResource::collection($users),
            'meta'  => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    /**
     * Get a specific user's full profile.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::with(['kycSubmission.reviewer', 'roles'])->findOrFail($id);

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Activate or deactivate a user account.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:active,inactive,suspended'],
        ]);

        $user = User::findOrFail($id);

        if ($user->hasRole('admin')) {
            return response()->json(['message' => 'Cannot change admin status.'], 403);
        }

        $user->update(['status' => $request->status]);

        return response()->json([
            'message' => "User status updated to {$request->status}.",
            'user'    => new UserResource($user),
        ]);
    }
}
