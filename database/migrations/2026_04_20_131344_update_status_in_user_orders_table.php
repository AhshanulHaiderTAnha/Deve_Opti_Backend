<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change from ENUM to VARCHAR(255) to support any string value like 'skipped'
        DB::statement("ALTER TABLE user_orders MODIFY COLUMN status VARCHAR(255) NOT NULL DEFAULT 'completed'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Change back to ENUM if needed, but might lose other values
        DB::statement("ALTER TABLE user_orders MODIFY COLUMN status ENUM('completed') NOT NULL DEFAULT 'completed'");
    }
};
