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
        Schema::create('order_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('commission_type', ['tier', 'manual'])->default('tier');
            $table->foreignId('commission_tier_id')->nullable()->constrained('commission_tiers')->nullOnDelete();
            $table->decimal('manual_commission_percent', 5, 2)->nullable();
            $table->integer('required_orders')->default(25);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('order_task_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_task_id')->constrained('order_tasks')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_tasks');
    }
};
