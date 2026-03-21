<x-mail::message>
# New Task Assigned: {{ $userTask->orderTask->title }}

Hello {{ $user->name }},

Great news! A new batch of orders has been assigned to your account. You can now start processing these orders and earning commissions directly to your wallet.

**Task Details:**
- **Required Orders to Complete:** {{ $userTask->orderTask->required_orders }} items
- **Commission Rate:** {{ $userTask->orderTask->commission_type === 'tier' ? ($userTask->orderTask->tier->name ?? 'Tier Base') . ' Rate' : $userTask->orderTask->manual_commission_percent . '%' }}

<x-mail::panel>
Complete all {{ $userTask->orderTask->required_orders }} orders to unlock your commission payload!
</x-mail::panel>

<x-mail::button :url="config('app.frontend_url') . '/my-orders'">
Start Processing Now
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
