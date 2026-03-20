<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    // Register
    public function register(RegisterRequest $request): JsonResponse
    {
        $user  = $this->authService->register($request->validated());
        $token = $this->authService->issueToken($user, $request->input('device_name', 'api'));

        return response()->json([
            'message' => 'Registration successful. Please verify your email.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ], 201);
    }

    // Login
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Your account has been suspended.'], 403);
        }

        $token = $this->authService->issueToken($user, $request->input('device_name', 'api'));

        \App\Models\UserActivityLog::create([
            'user_id'    => $user->id,
            'ip_address' => $request->ip(),
            'details'    => $request->userAgent(),
            'action'     => 'Logged In',
        ]);

        return response()->json([
            'message' => 'Login successful.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ]);
    }

    // Logout
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        \App\Models\UserActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Logged Out',
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'Logged out successfully.']);
    }

    // Email Verification
    public function verifyEmail(Request $request): JsonResponse
    {
        $user = User::findOrFail($request->route('id'));

        if (! hash_equals(sha1($user->email), (string) $request->route('hash'))) {
            return response()->json(['message' => 'Invalid verification link.'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        return response()->json(['message' => 'Email verified successfully.']);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent.']);
    }

    // Password Reset
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = $this->authService->sendPasswordResetLink($request->email);

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Password reset link sent to your email.']);
        }

        return response()->json(['message' => 'Unable to send reset link.'], 400);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'                 => ['required'],
            'email'                 => ['required', 'email'],
            'password'              => ['required', 'string', 'min:8', 'confirmed',
                                        'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'],
        ]);

        $status = $this->authService->resetPassword($request->only(
            'token', 'email', 'password', 'password_confirmation'
        ));

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password reset successfully.']);
        }

        return response()->json(['message' => 'Invalid or expired reset token.'], 400);
    }

    // Profile

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('kycSubmission')),
        ]);
    }

    // Profile Update
    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name'  => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
        ]);

        $user = $this->authService->updateProfile($request->user(), $request->only('name', 'phone'));

        \App\Models\UserActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Account Profile Updated',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => new UserResource($user),
        ]);
    }

    // Change Password
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'string', 'min:8', 'confirmed',
                                   'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'],
        ], [
            'password.regex' => 'The password must contain at least one uppercase letter, one lowercase letter, and one number.',
        ]);

        $this->authService->changePassword($request->user(), $request->password);

        \App\Models\UserActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Password Changed',
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'Password changed successfully.']);
    }

    // Profile Image Upload
    public function updateProfileImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:2048'], // Max 2MB
        ]);

        $user = $this->authService->updateProfileImage($request->user(), $request->file('image'));

        return response()->json([
            'message' => 'Profile image updated successfully.',
            'user'    => new UserResource($user),
        ]);
    }
}
