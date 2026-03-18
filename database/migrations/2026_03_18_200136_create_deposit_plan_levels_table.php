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
        Schema::create('deposit_plan_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deposit_plan_id')->constrained('deposit_plans')->onDelete('cascade');
            $table->decimal('min_amount', 15, 2);
            $table->decimal('max_amount', 15, 2);
            $table->decimal('profit_value', 10, 2);
            $table->enum('profit_type', ['fixed', 'percentage'])->default('percentage');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deposit_plan_levels');
    }
};
