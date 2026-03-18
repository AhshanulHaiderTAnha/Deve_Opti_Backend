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
        Schema::create('deposit_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('min_amount', 15, 2);
            $table->decimal('max_amount', 15, 2);
            $table->decimal('profit_value', 10, 2);
            $table->enum('profit_type', ['fixed', 'percentage'])->default('percentage');
            $table->integer('duration');
            $table->enum('duration_type', ['hours', 'days', 'weeks', 'months', 'years'])->default('days');
            $table->string('image_path')->nullable();
            $table->enum('status', ['published', 'inactive'])->default('published');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deposit_plans');
    }
};
