<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_task_products', function (Blueprint $table) {
            // Type of override: null = inherit task default, 'percent' = use custom_commission_percent, 'flat' = use custom_commission_flat
            $table->enum('custom_commission_type', ['percent', 'flat'])->nullable()->after('custom_commission_percent');
            // Flat dollar amount override (used when custom_commission_type = 'flat')
            $table->decimal('custom_commission_flat', 10, 2)->nullable()->after('custom_commission_type');
        });
    }

    public function down(): void
    {
        Schema::table('order_task_products', function (Blueprint $table) {
            $table->dropColumn(['custom_commission_type', 'custom_commission_flat']);
        });
    }
};
