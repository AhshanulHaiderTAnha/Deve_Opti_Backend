<x-mail::message>
# Ticket Closed

Hello {{ $ticket->user->name }},

Your support ticket **{{ $ticket->ticket_id }}** has been marked as closed. We hope your issue was resolved to your satisfaction.

**Subject:** {{ $ticket->subject }}

If you need further assistance, please feel free to open a new ticket.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
