<x-mail::message>
# New Deposit Request Pending

A new deposit request has been submitted by **{{ $depositRequest->user->name }}**.

- **Amount:** ${{ number_format($depositRequest->amount, 2) }}
- **Payment Method:** {{ $depositRequest->paymentMethod->name ?? 'N/A' }}

Please log in to the admin panel to review and approve/reject this request.

<x-mail::button :url="url('/admin/deposit-requests')">
Review Request
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
