<?php

namespace App\Mail;

use App\Models\OrderRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderRequestAdminMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $orderRequest;
    public $user;
    public $action; // 'created' or 'cancelled'

    public function __construct(OrderRequest $orderRequest, User $user, $action)
    {
        $this->orderRequest = $orderRequest;
        $this->user = $user;
        $this->action = $action;
    }

    public function envelope(): Envelope
    {
        $subject = $this->action === 'created' 
            ? 'New Order Request from ' . $this->user->name
            : 'Order Request Cancelled by ' . $this->user->name;

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.order_requests.admin_notification',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
