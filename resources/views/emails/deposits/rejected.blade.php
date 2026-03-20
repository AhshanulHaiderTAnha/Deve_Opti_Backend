<x-mail::message>
# Deposit Request Rejected

Hi **{{ $depositRequest->user->name }}**,

Unfortunately, your recent deposit request for **${{ number_format($depositRequest->amount, 2) }}** has been rejected.

@if($depositRequest->admin_comments)
**Reason:** {{ $depositRequest->admin_comments }}
@endif

If you have any questions, please contact support.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
