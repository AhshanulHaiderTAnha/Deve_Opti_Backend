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
        Schema::create('commission_tier_benefits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commission_tier_id')->constrained('commission_tiers')->onDelete('cascade');
            $table->string('benefit');
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_tier_benefits');
    }
};
