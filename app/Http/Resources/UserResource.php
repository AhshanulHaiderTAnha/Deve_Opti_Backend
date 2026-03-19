<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'name'                 => $this->name,
            'email'                => $this->email,
            'phone'                => $this->phone,
            'profile_image_url'    => $this->profile_image_url,
            'status'               => $this->status,
            'email_verified'       => ! is_null($this->email_verified_at),
            'email_verified_at'    => $this->email_verified_at?->toIso8601String(),
            'two_factor_enabled'   => $this->hasTwoFactorEnabled(),
            'roles'                => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')),
            'role'                 => $this->roles->first()?->name,
            'kyc'                  => $this->whenLoaded('kycSubmission', fn () =>
                $this->kycSubmission ? new KycResource($this->kycSubmission) : null
            ),
            'kyc_status'           => $this->whenLoaded('kycSubmission', fn () =>
                $this->kycSubmission?->status ?? 'not_submitted'
            ),
            'created_at'           => $this->created_at->toIso8601String(),
            'updated_at'           => $this->updated_at->toIso8601String(),
        ];
    }
}
