<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DepositRequestAdminMail extends Mailable implements ShouldQueue

{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $depositRequest;

    public function __construct($depositRequest)
    {
        $this->depositRequest = $depositRequest;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Deposit Request Submitted',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.deposits.admin_request',
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
