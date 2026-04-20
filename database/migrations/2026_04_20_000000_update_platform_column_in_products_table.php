<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // SQLite doesn't support modifying enum columns directly, 
        // and even in MySQL, it's often better to just use string if we expect changes.
        // However, to stay consistent with the existing migration, we'll update the enum.
        
        Schema::table('products', function (Blueprint $table) {
            $table->string('platform')->default('Other')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->enum('platform', ['Walmart', 'eBay', 'AliExpress', 'Other'])->default('Other')->change();
        });
    }
};
