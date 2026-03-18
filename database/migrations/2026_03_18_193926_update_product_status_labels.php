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
        Schema::table('products', function (Blueprint $table) {
            $table->enum('status_new', ['published', 'inactive'])->default('published')->after('status');
        });

        // Map old values to new ones
        DB::statement("UPDATE products SET status_new = 'published' WHERE status = 'active'");
        DB::statement("UPDATE products SET status_new = 'inactive' WHERE status = 'inactive'");

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->renameColumn('status_new', 'status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
