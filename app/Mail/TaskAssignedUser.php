<?php

namespace App\Mail;

use App\Models\UserTask;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TaskAssignedUser extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $userTask;
    public $user;

    public function __construct(UserTask $userTask, User $user)
    {
        $this->userTask = $userTask;
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Task Assignment',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.tasks.assigned',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
