<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class KycSubmitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name'     => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'country'       => ['required', 'string', 'max:100'],
            'id_type'       => ['required', 'in:passport,national_id,driving_license'],
            'id_number'     => ['required', 'string', 'max:100'],
            'id_document'   => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'selfie'        => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:5120'],
            'address'       => ['required', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'id_document.max' => 'ID document must not exceed 5MB.',
            'selfie.max'      => 'Selfie photo must not exceed 5MB.',
        ];
    }
}
