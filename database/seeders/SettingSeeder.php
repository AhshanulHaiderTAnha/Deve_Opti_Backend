<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General
            ['key' => 'system_name', 'value' => 'DEVE OPTI', 'group' => 'general', 'type' => 'string'],
            
            // Branding
            ['key' => 'site_logo', 'value' => '/assets/branding/logo.png', 'group' => 'branding', 'type' => 'image'],
            ['key' => 'site_favicon', 'value' => '/favicon.ico', 'group' => 'branding', 'type' => 'image'],
            
            // SEO
            ['key' => 'meta_title', 'value' => 'Deve Opti - Next Gen Logistics', 'group' => 'seo', 'type' => 'string'],
            ['key' => 'meta_description', 'value' => 'Advanced logistics and e-commerce management platform.', 'group' => 'seo', 'type' => 'text'],
            ['key' => 'meta_keywords', 'value' => 'logistics, shipping, e-commerce, kyc', 'group' => 'seo', 'type' => 'string'],
            ['key' => 'google_analytics_id', 'value' => 'G-XXXXXXXXXX', 'group' => 'seo', 'type' => 'string'],
            
            // Email
            ['key' => 'mail_from_name', 'value' => 'Deve Opti Support', 'group' => 'email', 'type' => 'string'],
            ['key' => 'mail_from_address', 'value' => 'no-reply@deveopti.com', 'group' => 'email', 'type' => 'string'],
            ['key' => 'mail_host', 'value' => 'smtp.mailtrap.io', 'group' => 'email', 'type' => 'string'],
            ['key' => 'mail_port', 'value' => '2525', 'group' => 'email', 'type' => 'string'],
        ];

        foreach ($settings as $setting) {
            \App\Models\Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
