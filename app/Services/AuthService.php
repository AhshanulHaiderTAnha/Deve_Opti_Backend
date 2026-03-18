<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;
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
            'status'   => 'active',
        ]);

        $user->assignRole('user');

        event(new Registered($user));

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
}
