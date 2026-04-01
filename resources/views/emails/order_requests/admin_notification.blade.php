<x-mail::message>
# Order Request {{ ucfirst($action) }}

Hello Admin,

An order request has been **{{ $action }}** by a customer.

**Customer Details:**
- **Name:** {{ $user->name }}
- **Email:** {{ $user->email }}

**Request Data:**
- **Content:** {{ $orderRequest->order_request_data }}
- **Date:** {{ $orderRequest->created_at->format('M d, Y H:i') }}

<x-mail::button :url="config('app.url') . '/admin/order-requests'">
View Order Requests
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
