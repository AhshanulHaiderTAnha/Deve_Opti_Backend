<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Admin User ───────────────────────────────────────────────────────
        $admin = User::updateOrCreate(
            ['email' => 'admin@deveopti.com'],
            [
                'name'              => 'Super Admin',
                'password'          => Hash::make('Admin@12345'),
                'phone'             => '+1000000000',
                'status'            => 'active',
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // ─── Normal User 1 ────────────────────────────────────────────────────
        $user1 = User::updateOrCreate(
            ['email' => 'john.doe@deveopti.com'],
            [
                'name'              => 'John Doe',
                'password'          => Hash::make('User@12345'),
                'phone'             => '+1000000001',
                'status'            => 'active',
                'email_verified_at' => now(),
            ]
        );
        $user1->assignRole('user');

        // ─── Normal User 2 ────────────────────────────────────────────────────
        $user2 = User::updateOrCreate(
            ['email' => 'jane.smith@deveopti.com'],
            [
                'name'              => 'Jane Smith',
                'password'          => Hash::make('User@12345'),
                'phone'             => '+1000000002',
                'status'            => 'active',
                'email_verified_at' => now(),
            ]
        );
        $user2->assignRole('user');

        $this->command->info('✅ Users seeded:');
        $this->command->table(
            ['Email', 'Role', 'Password'],
            [
                ['admin@deveopti.com',      'admin', 'Admin@12345'],
                ['john.doe@deveopti.com',   'user',  'User@12345'],
                ['jane.smith@deveopti.com', 'user',  'User@12345'],
            ]
        );
    }
}
