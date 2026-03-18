<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\PaymentMethod;
use App\Models\PaymentMethodDetail;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
    */
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Binance Pay',
                'details' => [
                    ['label' => 'Binance ID', 'value' => '123456789', 'note' => 'Scan QR for faster processing.'],
                ]
            ],
            [
                'name' => 'Crypto Wallets',
                'details' => [
                    ['label' => 'BTC Address', 'value' => '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', 'note' => 'Bitcoin network only.'],
                    ['label' => 'ETH Address', 'value' => '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'note' => 'ERC20 network only.'],
                ]
            ],
            [
                'name' => 'USDT (TRC20)',
                'details' => [
                    ['label' => 'USDT Wallet', 'value' => 'TR7NHqjuSXPabTHH9RzN4WESrZw76H69', 'note' => 'Strictly TRC20 network.'],
                ]
            ],
        ];

        foreach ($methods as $methodData) {
            $method = PaymentMethod::updateOrCreate(
                ['slug' => Str::slug($methodData['name'])],
                [
                    'name' => $methodData['name'],
                    'status' => 'active',
                ]
            );

            // Refresh details
            $method->details()->delete();
            foreach ($methodData['details'] as $detail) {
                $method->details()->create($detail);
            }
        }
    }
}
