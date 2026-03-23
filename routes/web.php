<?php

use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\KycController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\Admin\DepositPlanController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SellerController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SupportTicketController as AdminSupportTicketController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SuccessStoryController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\SubscriberController;
use App\Http\Controllers\Admin\WalletController;
use App\Http\Controllers\Admin\DepositController;
use App\Http\Controllers\Admin\WithdrawalController;
use App\Http\Controllers\Admin\CommissionTierController;
use App\Http\Controllers\Admin\OrderTaskController;
use App\Http\Controllers\Admin\UserTaskController;
use App\Http\Controllers\Admin\UserActivityLogController;
use App\Http\Controllers\Admin\AnnouncementController;
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
        Route::get('/users/export',   [UserController::class, 'export'])->name('users.export');
        Route::get('/users/search-ajax', [UserController::class, 'searchAjax'])->name('users.search-ajax');
        Route::post('/users',         [UserController::class, 'store'])->name('users.store');
        Route::get('/users/{id}',     [UserController::class, 'show'])->name('users.show');
        Route::patch('/users/{id}',   [UserController::class, 'update'])->name('users.update');
        Route::patch('/users/{id}/status', [UserController::class, 'updateStatus'])->name('users.status');
        Route::patch('/users/{id}/kyc-status', [UserController::class, 'updateKycStatus'])->name('users.kyc-status');
        // Settings management
        Route::get('/settings',       [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings',      [SettingController::class, 'update'])->name('settings.update');
        // KYC management
        Route::get('/kyc',            [KycController::class, 'index'])->name('kyc.index');
        Route::get('/kyc/{id}',       [KycController::class, 'show'])->name('kyc.show');
        Route::post('/kyc/{id}/approve', [KycController::class, 'approve'])->name('kyc.approve');
        Route::post('/kyc/{id}/reject',  [KycController::class, 'reject'])->name('kyc.reject');
        // Seller Management
        Route::resource('sellers', SellerController::class)->except(['create', 'edit', 'show']);
        // Payment Methods Management
        Route::resource('payment-methods', PaymentMethodController::class)->except(['create', 'edit', 'show']);
        // Product Management
        Route::resource('products', ProductController::class)->except(['create', 'edit', 'show']);
        // Deposit Plans Management
        Route::resource('deposit-plans', DepositPlanController::class)->except(['create', 'edit', 'show']);
        // Commission Tiers Management
        Route::resource('commission-tiers', CommissionTierController::class)->except(['create', 'edit', 'show']);
        // Order Tasks System
        Route::resource('order-tasks', OrderTaskController::class)->except(['create', 'edit', 'show']);
        Route::resource('user-tasks', UserTaskController::class)->only(['index', 'store', 'destroy']);
        // Support Tickets
        Route::get('support-tickets', [AdminSupportTicketController::class, 'index'])->name('support-tickets.index');
        Route::post('support-tickets', [AdminSupportTicketController::class, 'store'])->name('support-tickets.store');
        Route::get('support-tickets/{support_ticket}', [AdminSupportTicketController::class, 'show'])->name('support-tickets.show');
        Route::post('support-tickets/{support_ticket}/reply', [AdminSupportTicketController::class, 'reply'])->name('support-tickets.reply');
        Route::patch('support-tickets/{support_ticket}/close', [AdminSupportTicketController::class, 'close'])->name('support-tickets.close');
        // Success Stories & FAQ
        Route::resource('success-stories', SuccessStoryController::class)->except(['create', 'edit', 'show']);
        Route::resource('faqs', FaqController::class)->except(['create', 'edit', 'show']);
        Route::resource('subscribers',SubscriberController::class)->only(['index', 'destroy']);
        // Wallet System
        Route::get('wallets', [WalletController::class, 'index'])->name('wallets.index');
        // Deposit
        Route::get('deposits', [DepositController::class, 'index'])->name('deposits.index');
        Route::post('deposits/{deposit}/approve', [DepositController::class, 'approve'])->name('deposits.approve');
        Route::post('deposits/{deposit}/reject', [DepositController::class, 'reject'])->name('deposits.reject');
        // Withdrawals
        Route::get('withdrawals', [WithdrawalController::class, 'index'])->name('withdrawals.index');
        Route::post('withdrawals/{withdrawal}/approve', [WithdrawalController::class, 'approve'])->name('withdrawals.approve');
        Route::post('withdrawals/{withdrawal}/reject', [WithdrawalController::class, 'reject'])->name('withdrawals.reject');
        // Logs
        Route::get('activity-logs', [UserActivityLogController::class, 'index'])->name('activity-logs.index');
        Route::delete('activity-logs/{userActivityLog}', [UserActivityLogController::class, 'destroy'])->name('activity-logs.destroy');
        Route::post('activity-logs/clear-old', [UserActivityLogController::class, 'clearOld'])->name('activity-logs.clear');
        // Announcements
        Route::resource('announcements', AnnouncementController::class)->except(['create', 'edit', 'show']);
    });
});

// Redirect root to dashboard (auth middleware will handle guest redirection to login)
Route::get('/', fn () => redirect()->route('admin.dashboard'));
