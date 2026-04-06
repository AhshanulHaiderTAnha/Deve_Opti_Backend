<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TermsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $terms = [
            [
                'type' => 'terms',
                'title' => '1. Introduction',
                'slug' => 'introduction',
                'content' => '<p>Welcome to our platform. These Terms of Service govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms.</p>',
                'position' => 1,
                'status' => 'active',
            ],
            [
                'type' => 'terms',
                'title' => '2. Account Registration',
                'slug' => 'account-registration',
                'content' => '<p>To use certain features of our services, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process.</p>',
                'position' => 2,
                'status' => 'active',
            ],
            [
                'type' => 'terms',
                'title' => '3. Prohibited Activities',
                'slug' => 'prohibited-activities',
                'content' => '<p>You agree not to engage in any of the following prohibited activities: (i) copying, distributing, or disclosing any part of the service in any medium; (ii) using any automated system, including "robots," "spiders," etc.</p>',
                'position' => 3,
                'status' => 'active',
            ],
            [
                'type' => 'terms',
                'title' => '4. Intellectual Property',
                'slug' => 'intellectual-property',
                'content' => '<p>The service and its original content, features, and functionality are and will remain the exclusive property of the company and its licensors.</p>',
                'position' => 4,
                'status' => 'active',
            ],
            [
                'type' => 'terms',
                'title' => '5. Termination',
                'slug' => 'termination',
                'content' => '<p>We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.</p>',
                'position' => 5,
                'status' => 'active',
            ],
        ];

        foreach ($terms as $term) {
            \App\Models\LegalDocument::create($term);
        }
    }
}
