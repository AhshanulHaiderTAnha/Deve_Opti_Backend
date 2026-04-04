<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_task_products', function (Blueprint $table) {
            $table->decimal('custom_commission_percent', 5, 2)->nullable()->after('product_id');
        });
    }

    public function down(): void
    {
        Schema::table('order_task_products', function (Blueprint $table) {
            $table->dropColumn('custom_commission_percent');
        });
    }
};
