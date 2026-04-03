<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportMessage;
use App\Mail\TicketClosedUserMail;
use App\Models\User;
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
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function export(Request $request)
    {
        $startDate = $request->start_date ? \Carbon\Carbon::parse($request->start_date) : now()->subDays(15);
        $endDate = $request->end_date ? \Carbon\Carbon::parse($request->end_date) : now();

        if ($startDate->diffInDays($endDate) > 15) {
            return back()->with('error', 'Export date range cannot exceed 15 days.');
        }

        $query = SupportTicket::with(['user'])->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()]);

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

        $tickets = $query->latest('last_reply_at')->get();

        $filename = "support_tickets_report_" . now()->format('Ymd_His') . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];
        $columns = ['Ticket ID', 'User Name', 'User Email', 'Subject', 'Priority', 'Status', 'Last Reply At'];

        $callback = function() use($tickets, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($tickets as $t) {
                fputcsv($file, [
                    $t->ticket_id,
                    $t->user->name ?? 'N/A',
                    $t->user->email ?? 'N/A',
                    $t->subject,
                    $t->priority,
                    $t->status,
                    $t->last_reply_at ? \Carbon\Carbon::parse($t->last_reply_at)->format('Y-m-d H:i:s') : 'N/A'
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }

    public function show(SupportTicket $supportTicket)
    {
        // Mark user messages as read
        $supportTicket->messages()
            ->where('is_admin_reply', false)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('Admin/SupportTickets/Show', [
            'ticket' => $supportTicket->load(['user', 'messages.user']),
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'priority' => 'required|in:low,medium,high',
            'message' => 'required|string',
            'attachment' => 'nullable|file|max:5120',
        ]);

        $ticket = DB::transaction(function () use ($request) {
            $ticket = SupportTicket::create([
                'user_id' => $request->user_id,
                'ticket_id' => 'ST-' . strtoupper(str_shuffle(substr(md5(time()), 0, 6))),
                'subject' => $request->subject,
                'priority' => $request->priority,
                'status' => 'pending',
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
                'is_admin_reply' => true,
            ]);

            return $ticket;
        });

        return redirect()->route('admin.support-tickets.show', $ticket->id)
            ->with('success', 'Support ticket created successfully.');
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

    public function updateMessage(Request $request, SupportMessage $supportMessage)
    {
        if (!$supportMessage->is_admin_reply || $supportMessage->user_id !== auth()->id()) {
            return back()->with('error', 'Unauthorized.');
        }

        if ($supportMessage->read_at) {
            return back()->with('error', 'Cannot edit message after it has been seen.');
        }

        $request->validate([
            'message' => 'required|string',
        ]);

        $supportMessage->update([
            'message' => $request->message,
        ]);

        return back()->with('success', 'Message updated successfully.');
    }

    public function deleteMessage(SupportMessage $supportMessage)
    {
        if (!$supportMessage->is_admin_reply || $supportMessage->user_id !== auth()->id()) {
            return back()->with('error', 'Unauthorized.');
        }

        if ($supportMessage->read_at) {
            return back()->with('error', 'Cannot delete message after it has been seen.');
        }

        if ($supportMessage->attachment_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($supportMessage->attachment_path);
        }

        $supportMessage->delete();

        return back()->with('success', 'Message deleted successfully.');
    }
}
