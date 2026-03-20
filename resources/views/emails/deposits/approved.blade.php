<x-mail::message>
# Deposit Approved!

Great news, **{{ $depositRequest->user->name }}**! Your deposit of **${{ number_format($depositRequest->amount, 2) }}** has been approved and credited to your wallet.

You can now use your wallet balance on the platform.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
