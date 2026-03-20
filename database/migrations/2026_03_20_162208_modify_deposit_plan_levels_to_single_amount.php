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
        Schema::table('deposit_plan_levels', function (Blueprint $table) {
            $table->renameColumn('min_amount', 'amount');
            $table->dropColumn('max_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deposit_plan_levels', function (Blueprint $table) {
            $table->renameColumn('amount', 'min_amount');
            $table->decimal('max_amount', 15, 2)->after('min_amount')->nullable();
        });
    }
};
