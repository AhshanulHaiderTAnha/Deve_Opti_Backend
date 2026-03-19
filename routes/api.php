<?php

use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\KycController as AdminKycController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\User\KycController as UserKycController;
use App\Http\Controllers\Api\User\PaymentMethodController;
use App\Http\Controllers\Api\User\DepositPlanController;
use App\Http\Controllers\Api\User\ProductController;
use App\Http\Controllers\Api\User\SupportTicketController;
use App\Http\Controllers\Api\Public\PublicController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

// ─────────────────────────────────────────────────────────────────────────────
// Public Resources (Cached)
// ─────────────────────────────────────────────────────────────────────────────
Route::prefix('public')->group(function () {
    Route::get('success-stories', [PublicController::class, 'successStories']);
    Route::get('faqs', [PublicController::class, 'faqs']);
    Route::post('subscribe', [PublicController::class, 'subscribe']);
});

// ─────────────────────────────────────────────────────────────────────────────
// Public Auth Routes  (rate limited)
// ─────────────────────────────────────────────────────────────────────────────
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('register',              [AuthController::class, 'register']);
    Route::post('login',                 [AuthController::class, 'login'])->name('login');
    Route::get('verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])->middleware('signed')->name('api.auth.verify-email');
    Route::post('resend-verification',   [AuthController::class, 'resendVerification']);
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('forgot-password',   [AuthController::class, 'forgotPassword']);
        Route::post('reset-password',    [AuthController::class, 'resetPassword']);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Routes
// ─────────────────────────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {

    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [AuthController::class, 'me']);
    Route::patch('auth/profile', [AuthController::class, 'updateProfile']);
    Route::patch('auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('auth/profile-image', [AuthController::class, 'updateProfileImage']);

    // User Routes
    Route::prefix('user')->middleware('role:user')->group(function () {
        Route::get('profile',           [AuthController::class, 'me']);
        Route::post('kyc-submit',       [UserKycController::class, 'submit']);
        Route::get('kyc-status',        [UserKycController::class, 'status']);
        // Payment Methods
        Route::get('payment-methods',         [PaymentMethodController::class, 'index']);
        Route::get('payment-methods/{slug}',  [PaymentMethodController::class, 'show']);
        // Products
        Route::get('products',         [ProductController::class, 'index']);
        Route::get('products/{slug}',  [ProductController::class, 'show']);
        // Deposit Plans
        Route::get('deposit-plans',         [DepositPlanController::class, 'index']);
        Route::get('deposit-plans/{slug}',  [DepositPlanController::class, 'show']);
        // Support Tickets
        Route::get('support-tickets',         [SupportTicketController::class, 'index']);
        Route::post('support-tickets',        [SupportTicketController::class, 'store']);
        Route::get('support-tickets/{ticket_id}', [SupportTicketController::class, 'show']);
        Route::post('support-tickets/{ticket_id}/reply', [SupportTicketController::class, 'reply']);
    });

    // Admin Routes
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('dashboard',         [DashboardController::class, 'stats']);

        // User management
        Route::get('users',             [AdminUserController::class, 'index']);
        Route::get('users/{id}',        [AdminUserController::class, 'show']);
        Route::patch('users/{id}/status', [AdminUserController::class, 'updateStatus']);

        // KYC management
        Route::get('kyc-list',          [AdminKycController::class, 'index']);
        Route::get('kyc/{id}',          [AdminKycController::class, 'show']);
        Route::post('kyc-approve/{id}', [AdminKycController::class, 'approve']);
        Route::post('kyc-reject/{id}',  [AdminKycController::class, 'reject']);

        // Secure KYC document download
        Route::get('kyc/{id}/document/{type}', function (int $id, string $type) {
            $kyc  = \App\Models\KycSubmission::findOrFail($id);
            $path = match ($type) {
                'id_document' => $kyc->id_document_path,
                'selfie'      => $kyc->selfie_path,
                default       => abort(400, 'Invalid document type.'),
            };

            if (! Storage::disk('local')->exists($path)) {
                abort(404, 'Document not found.');
            }

            return Storage::disk('local')->download($path);
        })->name('admin.kyc.document');
    });
});
