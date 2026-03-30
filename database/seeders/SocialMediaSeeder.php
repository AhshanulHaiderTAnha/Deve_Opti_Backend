<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SocialMediaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $platforms = [
            ['name' => 'Facebook', 'url' => 'https://facebook.com', 'icon' => 'facebook', 'position' => 1],
            ['name' => 'X', 'url' => 'https://x.com', 'icon' => 'close', 'position' => 2], // 'close' or 'x' depending on icon set, usually 'close' for X brand in some sets or custom
            ['name' => 'Instagram', 'url' => 'https://instagram.com', 'icon' => 'camera_alt', 'position' => 3],
            ['name' => 'Telegram', 'url' => 'https://t.me', 'icon' => 'send', 'position' => 4],
        ];

        foreach ($platforms as $platform) {
            \App\Models\SocialMedia::updateOrCreate(
                ['name' => $platform['name']],
                $platform
            );
        }
    }
}
