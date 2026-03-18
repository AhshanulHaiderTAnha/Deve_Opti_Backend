<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportMessage;
use App\Mail\TicketClosedUserMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $query = SupportTicket::with(['user', 'messages'])->withCount('messages');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('ticket_id', 'like', "%{$request->search}%")
                  ->orWhere('subject', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function($u) use ($request) {
                      $u->where('name', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Admin/SupportTickets/Index', [
            'tickets' => $query->latest('last_reply_at')->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function show(SupportTicket $supportTicket)
    {
        return Inertia::render('Admin/SupportTickets/Show', [
            'ticket' => $supportTicket->load(['user', 'messages.user']),
        ]);
    }

    public function reply(Request $request, SupportTicket $supportTicket)
    {
        $request->validate([
            'message' => 'required|string',
            'attachment' => 'nullable|file|max:5120', // 5MB
        ]);

        DB::transaction(function () use ($request, $supportTicket) {
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('support_attachments', 'public');
            }

            SupportMessage::create([
                'support_ticket_id' => $supportTicket->id,
                'user_id' => auth()->id(),
                'message' => $request->message,
                'attachment_path' => $attachmentPath,
                'is_admin_reply' => true,
            ]);

            $supportTicket->update([
                'status' => 'pending',
                'last_reply_at' => now(),
            ]);
        });

        return back()->with('success', 'Reply sent successfully.');
    }

    public function close(SupportTicket $supportTicket)
    {
        $supportTicket->update(['status' => 'closed']);

        Mail::to($supportTicket->user->email)->send(new TicketClosedUserMail($supportTicket));

        return back()->with('success', 'Ticket closed successfully.');
    }
}
