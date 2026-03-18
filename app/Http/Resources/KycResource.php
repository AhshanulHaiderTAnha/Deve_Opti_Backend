<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KycResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'user_id'          => $this->user_id,
            'user'             => $this->whenLoaded('user', fn () => [
                'id'    => $this->user->id,
                'name'  => $this->user->name,
                'email' => $this->user->email,
            ]),
            'full_name'        => $this->full_name,
            'date_of_birth'    => $this->date_of_birth?->toDateString(),
            'country'          => $this->country,
            'id_type'          => $this->id_type,
            'id_type_label'    => match($this->id_type) {
                'passport'      => 'Passport',
                'national_id'   => 'National ID',
                'driving_license' => 'Driving License',
                default         => $this->id_type,
            },
            'id_number'        => $this->id_number,
            'address'          => $this->address,
            'status'           => $this->status,
            'status_label'     => ucfirst($this->status),
            'rejection_reason' => $this->rejection_reason,
            'reviewed_by'      => $this->whenLoaded('reviewer', fn () => $this->reviewer ? [
                'id'   => $this->reviewer->id,
                'name' => $this->reviewer->name,
            ] : null),
            'reviewed_at'      => $this->reviewed_at?->toIso8601String(),
            // Signed URLs for secure document access (30 min expiry)
            'id_document_url'  => $this->id_document_path
                ? route('admin.kyc.document', ['id' => $this->id, 'type' => 'id_document'])
                : null,
            'selfie_url'       => $this->selfie_path
                ? route('admin.kyc.document', ['id' => $this->id, 'type' => 'selfie'])
                : null,
            'submitted_at'     => $this->created_at->toIso8601String(),
            'updated_at'       => $this->updated_at->toIso8601String(),
        ];
    }
}
