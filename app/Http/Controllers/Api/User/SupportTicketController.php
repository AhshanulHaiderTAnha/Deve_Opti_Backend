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

        return response()->json([
            'status' => 'success',
            'message' => 'Reply sent successfully'
        ]);
    }
}
