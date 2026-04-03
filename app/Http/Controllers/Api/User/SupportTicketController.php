<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportMessage;
use App\Models\User;
use App\Mail\TicketCreatedAdminMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SupportTicketController extends Controller
{
    public function index()
    {
        $tickets = SupportTicket::where('user_id', auth()->id())
            ->withCount('messages')
            ->latest('last_reply_at')
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $tickets
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'priority' => 'required|in:low,medium,high',
            'message' => 'required|string',
            'attachment' => 'nullable|file|max:5120',
        ]);

        $ticket = DB::transaction(function () use ($request) {
            $ticket = SupportTicket::create([
                'user_id' => auth()->id(),
                'ticket_id' => 'TKT-' . strtoupper(Str::random(10)),
                'subject' => $request->subject,
                'category' => $request->category,
                'priority' => $request->priority,
                'status' => 'open',
                'last_reply_at' => now(),
            ]);

            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('support_attachments', 'public');
            }

            SupportMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => auth()->id(),
                'message' => $request->message,
                'attachment_path' => $attachmentPath,
                'is_admin_reply' => false,
            ]);

            return $ticket;
        });

        \App\Models\UserActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'Support Ticket Created',
            'details' => "Created Ticket #{$ticket->ticket_id}",
            'ip_address' => $request->ip()
        ]);

        // Notify Admins
        $admin = env('ADMIN_EMAIL'); // Or notify all admins
        if ($admin) {
            Mail::to($admin)->send(new TicketCreatedAdminMail($ticket));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket created successfully',
            'data' => $ticket
        ]);
    }

    public function show($ticket_id)
    {
        $ticket = SupportTicket::where('user_id', auth()->id())
            ->where('ticket_id', $ticket_id)
            ->with(['messages.user'])
            ->firstOrFail();

        // Mark admin messages as read
        $ticket->messages()
            ->where('is_admin_reply', true)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'status' => 'success',
            'data' => $ticket
        ]);
    }

    public function reply(Request $request, $ticket_id)
    {
        $ticket = SupportTicket::where('user_id', auth()->id())
            ->where('ticket_id', $ticket_id)
            ->firstOrFail();

        if ($ticket->status === 'closed') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot reply to a closed ticket.'
            ], 403);
        }

        $request->validate([
            'message' => 'required|string',
            'attachment' => 'nullable|file|max:5120',
        ]);

        DB::transaction(function () use ($request, $ticket) {
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('support_attachments', 'public');
            }

            SupportMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => auth()->id(),
                'message' => $request->message,
                'attachment_path' => $attachmentPath,
                'is_admin_reply' => false,
            ]);

            $ticket->update([
                'status' => 'open',
                'last_reply_at' => now(),
            ]);
        });

        \App\Models\UserActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'Support Ticket Replied',
            'details' => "Replied to Ticket #{$ticket->ticket_id}",
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Reply sent successfully'
        ]);
    }

    public function updateMessage(Request $request, $message_id)
    {
        $message = SupportMessage::where('id', $message_id)
            ->where('user_id', auth()->id())
            ->where('is_admin_reply', false)
            ->firstOrFail();

        if ($message->read_at) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot edit a message after it has been seen.'
            ], 403);
        }

        $request->validate([
            'message' => 'required|string'
        ]);

        $message->update([
            'message' => $request->message
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Message updated successfully'
        ]);
    }

    public function deleteMessage($message_id)
    {
        $message = SupportMessage::where('id', $message_id)
            ->where('user_id', auth()->id())
            ->where('is_admin_reply', false)
            ->firstOrFail();

        if ($message->read_at) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete a message after it has been seen.'
            ], 403);
        }

        if ($message->attachment_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($message->attachment_path);
        }

        $message->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Message deleted successfully'
        ]);
    }
}
