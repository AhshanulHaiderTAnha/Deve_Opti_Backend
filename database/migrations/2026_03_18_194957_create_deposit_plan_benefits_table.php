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
        Schema::create('deposit_plan_benefits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_plan_id')->constrained('deposit_plans')->onDelete('cascade');
            $table->string('benefit_text');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deposit_plan_benefits');
    }
};
