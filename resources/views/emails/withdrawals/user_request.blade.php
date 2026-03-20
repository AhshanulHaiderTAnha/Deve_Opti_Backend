<x-mail::message>
# Withdrawal Request Received

Hi **{{ $withdrawalRequest->user->name }}**,

We have received your withdrawal request for **${{ number_format($withdrawalRequest->amount, 2) }}**. 

Your request is currently **pending** and will be reviewed by our team shortly. We will notify you once it has been processed.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
