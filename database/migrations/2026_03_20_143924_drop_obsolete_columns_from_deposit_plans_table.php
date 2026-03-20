<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * These columns were moved to the deposit_plan_levels table.
     * The original refactor migration (2026_03_18_200137) was left empty,
     * so the DB still has these required columns causing insert failures.
     */
    public function up(): void
    {
        Schema::table('deposit_plans', function (Blueprint $table) {
            $table->dropColumn(['min_amount', 'max_amount', 'profit_value', 'profit_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deposit_plans', function (Blueprint $table) {
            $table->decimal('min_amount', 15, 2)->after('slug');
            $table->decimal('max_amount', 15, 2)->after('min_amount');
            $table->decimal('profit_value', 10, 2)->after('max_amount');
            $table->enum('profit_type', ['fixed', 'percentage'])->default('percentage')->after('profit_value');
        });
    }
};
