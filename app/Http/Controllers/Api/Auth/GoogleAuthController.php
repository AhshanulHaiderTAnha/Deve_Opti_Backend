<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    /**
     * Get the Google OAuth URL.
     */
    public function getGoogleUrl(): JsonResponse
    {
        try {
            $url = Socialite::driver('google')
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            return response()->json([
                'url' => $url,
            ]);
        } catch (\Exception $e) {
            Log::error('Google Auth URL error: ' . $e->getMessage());
            return response()->json(['message' => 'Unable to generate Google login URL.'], 500);
        }
    }

    /**
     * Handle the callback from Google.
     * This endpoint receives the "code" from the frontend.
     */
    public function handleGoogleCallback(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        try {
            // Exchange the code for the user information
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Find or create the user
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Update existing user with google_id if not set
                if (empty($user->google_id)) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'google_avatar' => $googleUser->getAvatar(),
                    ]);
                }
            } else {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'google_avatar' => $googleUser->getAvatar(),
                    'status' => 'active',
                    'email_verified_at' => now(),
                    'password' => bcrypt(\Illuminate\Support\Str::random(16)), // Random password
                ]);
                $user->assignRole('user');
            }

            if ($user->status !== 'active') {
                return response()->json(['message' => 'Your account has been suspended.'], 403);
            }

            // Issue token
            $token = $this->authService->issueToken($user, $request->input('device_name', 'api'));

            // Log activity
            \App\Models\UserActivityLog::create([
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'details' => $request->userAgent(),
                'action' => 'Logged In via Google',
            ]);

            return response()->json([
                'message' => 'Login successful.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->google_avatar ?? $user->profile_image_url,
                    'role' => $user->role,
                ],
                'token' => $token,
            ]);

        } catch (\Exception $e) {
            Log::error('Google Auth Callback error: ' . $e->getMessage());
            return response()->json(['message' => 'Authentication failed.'], 401);
        }
    }
}
