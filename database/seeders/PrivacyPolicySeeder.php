<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PrivacyPolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $privacy = [
            [
                'type' => 'privacy',
                'title' => '1. Data Collection',
                'slug' => 'data-collection',
                'content' => '<p>We collect information you provide directly to us when you create an account, participate in any interactive features of our services, or fill out a form.</p>',
                'position' => 1,
                'status' => 'active',
            ],
            [
                'type' => 'privacy',
                'title' => '2. Use of Information',
                'slug' => 'use-of-information',
                'content' => '<p>We use the information we collect to provide, maintain, and improve our services, develop new ones, and protect our company and our users.</p>',
                'position' => 2,
                'status' => 'active',
            ],
            [
                'type' => 'privacy',
                'title' => '3. Data Sharing',
                'slug' => 'data-sharing',
                'content' => '<p>We do not share your personal information with companies, organizations, or individuals outside of our company except in following cases: with your consent, for external processing, or for legal reasons.</p>',
                'position' => 3,
                'status' => 'active',
            ],
            [
                'type' => 'privacy',
                'title' => '4. Security',
                'slug' => 'security',
                'content' => '<p>We use reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>',
                'position' => 4,
                'status' => 'active',
            ],
        ];

        foreach ($privacy as $item) {
            \App\Models\LegalDocument::create($item);
        }
    }
}
