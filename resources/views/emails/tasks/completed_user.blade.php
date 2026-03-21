<x-mail::message>
# Task Successfully Completed! 🎉

Hello {{ $user->name }},

Congratulations! You have successfully completed all {{ $userTask->orderTask->required_orders }} orders in the **{{ $userTask->orderTask->title }}** task batch.

Your hard work has paid off. We have immediately added your total earned commissions to your wallet.

<x-mail::panel>
**Total Commission Earned:** ${{ number_format($userTask->total_earned_commission, 2) }}
</x-mail::panel>

You can view your updated wallet balance or start another task if one is assigned.

<x-mail::button :url="config('app.frontend_url') . '/wallet'">
View Wallet Balance
</x-mail::button>

Thanks,<br>
{{ config('app.name') }} Support Team
</x-mail::message>
