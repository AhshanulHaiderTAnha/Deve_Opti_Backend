<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::role('user')
            ->with(['kycSubmission', 'roles'])
            ->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            }))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->kyc_status, fn ($q) => $q->whereHas(
                'kycSubmission', fn ($q) => $q->where('status', $request->kyc_status)
            ))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users'   => UserResource::collection($users),
            'filters' => $request->only(['search', 'status', 'kyc_status']),
        ]);
    }

    public function show(int $id): Response
    {
        $user = User::with(['kycSubmission.reviewer', 'roles'])->findOrFail($id);

        return Inertia::render('Admin/Users/Show', [
            'user' => new UserResource($user),
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate(['status' => ['required', 'in:active,inactive,suspended']]);
        $user = User::findOrFail($id);

        if ($user->hasRole('admin')) {
            return back()->withErrors(['status' => 'Cannot change admin status.']);
        }

        $user->update(['status' => $request->status]);

        return back()->with('success', "User status updated to {$request->status}.");
    }
}
