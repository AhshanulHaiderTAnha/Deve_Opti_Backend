<x-mail::message>
# Withdrawal Approved!

Great news, **{{ $withdrawalRequest->user->name }}**! Your withdrawal of **${{ number_format($withdrawalRequest->amount, 2) }}** has been approved and processed.

@if($withdrawalRequest->admin_transaction_id)
**Transaction ID:** {{ $withdrawalRequest->admin_transaction_id }}
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
