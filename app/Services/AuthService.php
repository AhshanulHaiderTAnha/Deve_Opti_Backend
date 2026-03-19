<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Password;

class AuthService
{
    /**
     * Register a new user.
     */
    public function register(array $data): User
    {
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'phone'    => $data['phone'] ?? null,
            'status'            => 'active',
            'email_verified_at' => now(), // Auto-verify account
        ]);

        $user->assignRole('user');

        \App\Models\UserActivity::create([
            'user_id'    => $user->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'action'     => 'register',
        ]);

        event(new Registered($user));

        Mail::to($user->email)->send(new WelcomeMail($user));

        return $user;
    }

    /**
     * Issue a Sanctum API token for a user.
     */
    public function issueToken(User $user, string $deviceName = 'api'): string
    {
        return $user->createToken($deviceName)->plainTextToken;
    }

    /**
     * Revoke all tokens for a user (logout).
     */
    public function revokeTokens(User $user): void
    {
        $user->tokens()->delete();
    }

    /**
     * Send password reset link.
     */
    public function sendPasswordResetLink(string $email): string
    {
        return Password::sendResetLink(['email' => $email]);
    }

    /**
     * Reset user password.
     */
    public function resetPassword(array $data): string
    {
        return Password::reset($data, function (User $user, string $password) {
            $user->forceFill([
                'password' => Hash::make($password),
            ])->save();

            $user->tokens()->delete();
        });
    }

    /**
     * Update user profile.
     */
    public function updateProfile(User $user, array $data): User
    {
        $user->update([
            'name'  => $data['name'] ?? $user->name,
            'phone' => $data['phone'] ?? $user->phone,
        ]);

        return $user;
    }

    /**
     * Change user password.
     */
    public function changePassword(User $user, string $newPassword): void
    {
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        // Revoke all tokens to force re-login on all devices
        $user->tokens()->delete();
    }

    /**
     * Update user profile image.
     */
    public function updateProfileImage(User $user, \Illuminate\Http\UploadedFile $image): User
    {
        // Delete old image if exists
        if ($user->profile_image_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_image_path);
        }

        $path = $image->store('profile-images', 'public');

        $user->update([
            'profile_image_path' => $path,
        ]);

        return $user;
    }
}
