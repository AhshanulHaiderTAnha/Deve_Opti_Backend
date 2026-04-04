<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add referral_code and referred_by to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code', 20)->unique()->nullable()->after('email');
            $table->unsignedBigInteger('referred_by')->nullable()->after('referral_code');
            $table->foreign('referred_by')->references('id')->on('users')->nullOnDelete();
        });

        // 2. Create referral_earnings table
        Schema::create('referral_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referred_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('deposit_request_id')->constrained('deposit_requests')->cascadeOnDelete();
            $table->tinyInteger('level'); // 1, 2, or 3
            $table->decimal('commission_rate', 5, 2); // e.g. 5.00, 3.00, 1.00
            $table->decimal('deposit_amount', 15, 2);
            $table->decimal('earned_amount', 15, 2);
            $table->enum('status', ['pending', 'credited'])->default('credited');
            $table->timestamps();

            // Indexes for performance
            $table->index(['user_id', 'level']);
            $table->index(['referred_user_id']);
            $table->index(['deposit_request_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_earnings');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['referred_by']);
            $table->dropColumn(['referral_code', 'referred_by']);
        });
    }
};
