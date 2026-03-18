<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        //Rate Limiters

        // Auth routes: 10 attempts per minute per IP
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // Sensitive routes: 5 per minute per IP (forgot password, etc.)
        RateLimiter::for('sensitive', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // General API: 60 per minute per user/IP
        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(60)->by($request->user()->id)
                : Limit::perMinute(30)->by($request->ip());
        });

        // Custom Email Notification URLs

        // Custom Verification URL for Frontend/API
        VerifyEmail::createUrlUsing(function ($notifiable) {
            $id   = $notifiable->getKey();
            $hash = sha1($notifiable->getEmailForVerification());
            // This points to the API verification route, which then handles the logic
            return route('api.auth.verify-email', ['id' => $id, 'hash' => $hash]);
        });

        // Custom Reset Password URL for Frontend
        ResetPassword::createUrlUsing(function ($user, string $token) {
            // Frontend reset password page URL
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($user->email);
        });
    }
}
