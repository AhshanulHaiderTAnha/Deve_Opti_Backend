<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kyc_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->date('date_of_birth');
            $table->string('country', 100);
            $table->enum('id_type', ['passport', 'national_id', 'driving_license']);
            $table->string('id_number', 100);
            $table->string('id_document_path');
            $table->string('selfie_path');
            $table->text('address');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            // Each user can only have one active KYC submission
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kyc_submissions');
    }
};
