<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WithdrawalRequestAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $withdrawalRequest;

    public function __construct($withdrawalRequest)
    {
        $this->withdrawalRequest = $withdrawalRequest;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Withdrawal Request Submitted',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.withdrawals.admin_request',
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
