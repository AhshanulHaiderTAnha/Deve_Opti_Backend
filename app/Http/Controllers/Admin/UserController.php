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
        $activities = $user->activities()->latest()->limit(5)->get();

        return Inertia::render('Admin/Users/Show', [
            'user'       => new UserResource($user),
            'activities' => $activities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'status'   => ['required', 'in:active,inactive,suspended'],
            'role'     => ['required', 'in:admin,user'],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => bcrypt($validated['password']),
            'status'   => $validated['status'],
        ]);

        $user->assignRole($validated['role']);

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', "unique:users,email,{$id}"],
            'password' => ['nullable', 'string', 'min:8'],
            'status'   => ['required', 'in:active,inactive,suspended'],
            'role'     => ['required', 'in:admin,user'],
        ]);

        $user->update([
            'name'   => $validated['name'],
            'email'  => $validated['email'],
            'status' => $validated['status'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => bcrypt($validated['password'])]);
        }

        $user->syncRoles([$validated['role']]);

        return back()->with('success', 'User updated successfully.');
    }

    public function updateKycStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected']
        ]);

        $user = User::findOrFail($id);
        
        // If user already has a submission, update it
        if ($user->kycSubmission) {
            $user->kycSubmission->update([
                'status' => $validated['status'],
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
        } else {
            // Otherwise create a dummy submission to hold the status
            $user->kycSubmission()->create([
                'status' => $validated['status'],
                'full_name' => $user->name,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
        }

        return back()->with('success', "KYC status updated to {$validated['status']}.");
    }

    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate(['status' => ['required', 'in:active,inactive,suspended']]);
        $user = User::findOrFail($id);

        if ($user->hasRole('admin') && $validated['status'] !== 'active') {
            return back()->withErrors(['status' => 'Cannot suspend an administrator.']);
        }

        $user->update(['status' => $validated['status']]);

        return back()->with('success', "User status updated to {$validated['status']}.");
    }
}
