<?php

namespace Database\Seeders;

use App\Models\CommissionTier;
use App\Models\CommissionTierBenefit;
use Illuminate\Database\Seeder;

class CommissionTierSeeder extends Seeder
{
    public function run()
    {
        $tiers = [
            [
                'name' => 'Walmart Tier',
                'min_amount' => 20,
                'max_amount' => 399,
                'commission_rate' => 4.0,
                'description' => 'per order',
                'icon' => 'shopping_cart',
                'sort_order' => 1,
                'benefits' => ['25 orders per batch', '4 batches per day max', 'Basic support', 'Fast payouts']
            ],
            [
                'name' => 'eBay Tier',
                'min_amount' => 400,
                'max_amount' => 799,
                'commission_rate' => 8.0,
                'description' => 'per order',
                'icon' => 'shopping_bag',
                'sort_order' => 2,
                'benefits' => ['25 orders per batch', '4 batches per day max', 'Priority support', 'Bonus opportunities']
            ],
            [
                'name' => 'AliExpress Tier',
                'min_amount' => 800,
                'max_amount' => null,
                'commission_rate' => 12.0,
                'description' => 'per order',
                'icon' => 'storefront',
                'sort_order' => 3,
                'benefits' => ['25 orders per batch', '4 batches per day max', 'VIP support', 'Exclusive bonuses']
            ],
        ];

        foreach ($tiers as $tierData) {
            $benefits = $tierData['benefits'];
            unset($tierData['benefits']);

            $tier = CommissionTier::create($tierData);

            foreach ($benefits as $benefit) {
                CommissionTierBenefit::create([
                    'commission_tier_id' => $tier->id,
                    'benefit' => $benefit,
                    'is_enabled' => true
                ]);
            }
        }
    }
}
