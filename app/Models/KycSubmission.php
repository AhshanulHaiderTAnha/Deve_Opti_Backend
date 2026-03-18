<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class KycSubmission extends Model
{
    use HasFactory;

    // ─── Status Constants ─────────────────────────────────────────────────────

    const STATUS_PENDING  = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    // ─── Fillable ─────────────────────────────────────────────────────────────

    protected $fillable = [
        'user_id',
        'full_name',
        'date_of_birth',
        'country',
        'id_type',
        'id_number',
        'id_document_path',
        'selfie_path',
        'address',
        'status',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
    ];

    // ─── Casts ────────────────────────────────────────────────────────────────

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'reviewed_at'   => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getIdDocumentUrlAttribute(): ?string
    {
        return $this->id_document_path
            ? Storage::temporaryUrl($this->id_document_path, now()->addMinutes(30))
            : null;
    }

    public function getSelfieUrlAttribute(): ?string
    {
        return $this->selfie_path
            ? Storage::temporaryUrl($this->selfie_path, now()->addMinutes(30))
            : null;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }
}
