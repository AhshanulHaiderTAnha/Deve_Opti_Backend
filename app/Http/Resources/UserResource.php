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
            'total_deposits'       => $this->total_deposits ?? 0,
            'total_withdrawals'    => $this->total_withdrawals ?? 0,
            'total_commissions'    => $this->total_commissions ?? 0,
            'referral_code'        => $this->referral_code,
            'referred_by_name'     => $this->whenLoaded('referrer', fn () => $this->referrer?->name),
            'total_referral_earnings' => $this->total_referral_earned ?? 0,
            'created_at'           => $this->created_at->toIso8601String(),
            'updated_at'           => $this->updated_at->toIso8601String(),
        ];
    }
}
