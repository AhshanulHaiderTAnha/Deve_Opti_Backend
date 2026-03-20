<x-mail::message>
# New Withdrawal Request Pending

A new withdrawal request has been submitted by **{{ $withdrawalRequest->user->name }}**.

- **Amount:** ${{ number_format($withdrawalRequest->amount, 2) }}
- **Gateway Info:** {{ $withdrawalRequest->payment_gateway_info }}

Please log in to the admin panel to process this withdrawal.

<x-mail::button :url="url('/admin/withdrawal-requests')">
Process Withdrawal
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
