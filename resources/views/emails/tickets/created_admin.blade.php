<x-mail::message>
# New Support Ticket Received

A new support ticket has been opened by **{{ $ticket->user->name }}**.

**Ticket ID:** {{ $ticket->ticket_id }}
**Subject:** {{ $ticket->subject }}
**Priority:** {{ ucfirst($ticket->priority) }}

<x-mail::button :url="config('app.url') . '/admin/support-tickets/' . $ticket->id">
View Ticket
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
