<?php

use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\KycController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Admin Authentication (Inertia pages)
Route::prefix('admin')->name('admin.')->group(function () {

    // Guest-only admin routes
    Route::middleware('guest')->group(function () {
        Route::get('/login',  [AdminAuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [AdminAuthController::class, 'login'])->name('login.store');
    });
    // Authenticated + admin-role-only
    Route::middleware(['auth', 'role:admin'])->group(function () {
        Route::post('/logout',        [AdminAuthController::class, 'logout'])->name('logout');
        Route::get('/dashboard',      [DashboardController::class, 'index'])->name('dashboard');
        // User management
        Route::get('/users',          [UserController::class, 'index'])->name('users.index');
        Route::post('/users',         [UserController::class, 'store'])->name('users.store');
        Route::get('/users/{id}',     [UserController::class, 'show'])->name('users.show');
        Route::patch('/users/{id}',   [UserController::class, 'update'])->name('users.update');
        Route::patch('/users/{id}/status', [UserController::class, 'updateStatus'])->name('users.status');
        // KYC management
        Route::get('/kyc',            [KycController::class, 'index'])->name('kyc.index');
        Route::get('/kyc/{id}',       [KycController::class, 'show'])->name('kyc.show');
        Route::post('/kyc/{id}/approve', [KycController::class, 'approve'])->name('kyc.approve');
        Route::post('/kyc/{id}/reject',  [KycController::class, 'reject'])->name('kyc.reject');
    });
});

// Redirect root to admin
Route::get('/', fn () => redirect('/admin/login'));
