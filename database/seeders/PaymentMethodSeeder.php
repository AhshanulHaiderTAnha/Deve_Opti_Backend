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
                'name' => 'BTC',
                'details' => [
                    ['label' => 'Wallet address', 'value' => 'bc1qw6muvpsxawqcl9rzs0tnsefcmc7xjhkxh6sn43', 'note' => 'Scan QR for faster processing.'],
                ]
            ],
            [
                'name' => 'ETH',
                'details' => [
                    ['label' => 'Wallet address', 'value' => '0x3D6Bd6A2760f3035134033b64eCD2973f4873407', 'note' => 'ERC20 network only.'],
                ]
            ],
            [
                'name' => 'USDT',
                'details' => [
                    ['label' => 'Wallet address', 'value' => 'TW5aiPmdx8Mdi1wMV41xGVZd9KKiVSrXit', 'note' => 'Strictly TRC20 network.'],
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
