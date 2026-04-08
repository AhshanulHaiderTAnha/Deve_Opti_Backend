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
use App\Http\Controllers\Admin\SocialMediaController;
use App\Http\Controllers\Admin\OrderRequestController as AdminOrderRequestController;
use App\Http\Controllers\Admin\ReferralController as AdminReferralController;
use App\Http\Controllers\Admin\LegalDocumentController;
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
        Route::post('/dashboard/clear-cache', [DashboardController::class, 'clearCache'])->name('dashboard.clear-cache');
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
        Route::get('sellers/export', [SellerController::class, 'export'])->name('sellers.export');
        Route::resource('sellers', SellerController::class)->except(['create', 'edit', 'show']);
        // Payment Methods Management
        Route::resource('payment-methods', PaymentMethodController::class)->except(['create', 'edit', 'show']);
        // Product Management
        Route::get('products/export', [ProductController::class, 'export'])->name('products.export');
        Route::resource('products', ProductController::class)->except(['create', 'edit', 'show']);
        // Deposit Plans Management
        Route::resource('deposit-plans', DepositPlanController::class)->except(['create', 'edit', 'show']);
        // Commission Tiers Management
        Route::resource('commission-tiers', CommissionTierController::class)->except(['create', 'edit', 'show']);
        // Order Tasks System
        Route::get('order-tasks/export', [OrderTaskController::class, 'export'])->name('order-tasks.export');
        Route::resource('order-tasks', OrderTaskController::class)->except(['create', 'edit', 'show']);
        Route::get('user-tasks/export', [UserTaskController::class, 'export'])->name('user-tasks.export');
        Route::resource('user-tasks', UserTaskController::class)->only(['index', 'store', 'destroy']);
        // Support Tickets
        Route::get('support-tickets/export', [AdminSupportTicketController::class, 'export'])->name('support-tickets.export');
        Route::get('support-tickets', [AdminSupportTicketController::class, 'index'])->name('support-tickets.index');
        Route::post('support-tickets', [AdminSupportTicketController::class, 'store'])->name('support-tickets.store');
        Route::get('support-tickets/{support_ticket}', [AdminSupportTicketController::class, 'show'])->name('support-tickets.show');
        Route::post('support-tickets/{support_ticket}/reply', [AdminSupportTicketController::class, 'reply'])->name('support-tickets.reply');
        Route::post('support-tickets/messages/{supportMessage}', [AdminSupportTicketController::class, 'updateMessage'])->name('support-tickets.message.update');
        Route::delete('support-tickets/messages/{supportMessage}', [AdminSupportTicketController::class, 'deleteMessage'])->name('support-tickets.message.delete');
        Route::patch('support-tickets/{support_ticket}/close', [AdminSupportTicketController::class, 'close'])->name('support-tickets.close');
        // Success Stories & FAQ
        Route::resource('success-stories', SuccessStoryController::class)->except(['create', 'edit', 'show']);
        Route::get('faqs/export', [FaqController::class, 'export'])->name('faqs.export');
        Route::resource('faqs', FaqController::class)->except(['create', 'edit', 'show']);
        Route::get('subscribers/export', [SubscriberController::class, 'export'])->name('subscribers.export');
        Route::resource('subscribers',SubscriberController::class)->only(['index', 'destroy']);
        // Wallet System
        Route::get('wallets', [WalletController::class, 'index'])->name('wallets.index');
        Route::post('wallets/deposit', [WalletController::class, 'deposit'])->name('wallets.deposit');
        // Deposit
        Route::get('deposits', [DepositController::class, 'index'])->name('deposits.index');
        Route::post('deposits/{deposit}/approve', [DepositController::class, 'approve'])->name('deposits.approve');
        Route::post('deposits/{deposit}/reject', [DepositController::class, 'reject'])->name('deposits.reject');
        // Withdrawals
        Route::get('withdrawals', [WithdrawalController::class, 'index'])->name('withdrawals.index');
        Route::post('withdrawals/{withdrawal}/approve', [WithdrawalController::class, 'approve'])->name('withdrawals.approve');
        Route::post('withdrawals/{withdrawal}/reject', [WithdrawalController::class, 'reject'])->name('withdrawals.reject');
        // Logs
        Route::get('activity-logs/export', [UserActivityLogController::class, 'export'])->name('activity-logs.export');
        Route::get('activity-logs', [UserActivityLogController::class, 'index'])->name('activity-logs.index');
        Route::delete('activity-logs/{userActivityLog}', [UserActivityLogController::class, 'destroy'])->name('activity-logs.destroy');
        Route::post('activity-logs/clear-old', [UserActivityLogController::class, 'clearOld'])->name('activity-logs.clear');
        // Announcements
        Route::get('announcements/export', [AnnouncementController::class, 'export'])->name('announcements.export');
        Route::resource('announcements', AnnouncementController::class)->except(['create', 'edit', 'show']);
        // Order Request management
        Route::get('order-requests', [AdminOrderRequestController::class, 'index'])->name('order-requests.index');
        Route::patch('order-requests/{id}/status', [AdminOrderRequestController::class, 'updateStatus'])->name('order-requests.status');
        // Social Media
        Route::resource('social-media', SocialMediaController::class)->parameters(['social-media' => 'socialMedia'])->except(['create', 'edit', 'show']);
        // Referral Management
        Route::get('referrals/export', [AdminReferralController::class, 'export'])->name('referrals.export');
        Route::get('referrals', [AdminReferralController::class, 'index'])->name('referrals.index');
        Route::get('referrals/{user_id}', [AdminReferralController::class, 'show'])->name('referrals.show');
        // Legal Documents
        Route::resource('legal-documents', LegalDocumentController::class)->except(['create', 'edit', 'show']);
    });
});

// Redirect root to dashboard (auth middleware will handle guest redirection to login)
Route::get('/', fn () => redirect()->route('admin.dashboard'));
