<?php

namespace App\Services;

use App\Models\KycSubmission;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class KycService
{
    /**
     * Store uploaded KYC documents securely and create/update KYC record.
     */
    public function submit(User $user, array $data, UploadedFile $idDocument, UploadedFile $selfie): KycSubmission
    {
        $basePath = "kyc/{$user->id}";

        // Store files on the local (private) disk
        $idDocPath  = $idDocument->store("{$basePath}/id",     'local');
        $selfiePath = $selfie->store("{$basePath}/selfie",     'local');

        // updateOrCreate allows user to re-submit if rejected
        $kyc = KycSubmission::updateOrCreate(
            ['user_id' => $user->id],
            [
                'full_name'          => $data['full_name'],
                'date_of_birth'      => $data['date_of_birth'],
                'country'            => $data['country'],
                'id_type'            => $data['id_type'],
                'id_number'          => $data['id_number'],
                'id_document_path'   => $idDocPath,
                'selfie_path'        => $selfiePath,
                'address'            => $data['address'],
                'status'             => KycSubmission::STATUS_PENDING,
                'reviewed_by'        => null,
                'reviewed_at'        => null,
                'rejection_reason'   => null,
            ]
        );

        return $kyc;
    }

    /**
     * Approve a KYC submission.
     */
    public function approve(KycSubmission $kyc, User $admin): void
    {
        $kyc->update([
            'status'           => KycSubmission::STATUS_APPROVED,
            'reviewed_by'      => $admin->id,
            'reviewed_at'      => now(),
            'rejection_reason' => null,
        ]);
    }

    /**
     * Reject a KYC submission with a reason.
     */
    public function reject(KycSubmission $kyc, User $admin, string $reason): void
    {
        $kyc->update([
            'status'           => KycSubmission::STATUS_REJECTED,
            'reviewed_by'      => $admin->id,
            'reviewed_at'      => now(),
            'rejection_reason' => $reason,
        ]);
    }

    /**
     * Delete old KYC document files.
     */
    public function deleteFiles(KycSubmission $kyc): void
    {
        if ($kyc->id_document_path) {
            Storage::disk('local')->delete($kyc->id_document_path);
        }
        if ($kyc->selfie_path) {
            Storage::disk('local')->delete($kyc->selfie_path);
        }
    }
}
