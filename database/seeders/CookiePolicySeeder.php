<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CookiePolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cookies = [
            [
                'type' => 'cookies',
                'title' => '1. What Are Cookies',
                'slug' => 'what-are-cookies',
                'content' => '<p>Cookies are small text files that are used to store small pieces of information. They are stored on your device when the website is loaded on your browser.</p>',
                'position' => 1,
                'status' => 'active',
            ],
            [
                'type' => 'cookies',
                'title' => '2. How We Use Cookies',
                'slug' => 'how-we-use-cookies',
                'content' => '<p>Our website uses first-party and third-party cookies for several purposes. First-party cookies are mostly necessary for the website to function the right way.</p>',
                'position' => 2,
                'status' => 'active',
            ],
            [
                'type' => 'cookies',
                'title' => '3. Types of Cookies We Use',
                'slug' => 'types-of-cookies',
                'content' => '<p>The cookies used on our website are grouped into the following categories: Necessary, Functional, Analytical, and Performance.</p>',
                'position' => 3,
                'status' => 'active',
            ],
            [
                'type' => 'cookies',
                'title' => '4. Control Cookies',
                'slug' => 'control-cookies',
                'content' => '<p>You can manage your cookie preferences by clicking on the settings button and enabling or disabling the cookie categories on the popup according to your preferences.</p>',
                'position' => 4,
                'status' => 'active',
            ],
        ];

        foreach ($cookies as $item) {
            \App\Models\LegalDocument::create($item);
        }
    }
}
