<?php

namespace App\Http\Requests\CategoriasGastos;

use Illuminate\Foundation\Http\FormRequest;

class ResumoCategoriasGastosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'mes' => ['nullable', 'string', 'regex:/^\\d{4}-(0[1-9]|1[0-2])$/'],
            'inicio' => ['nullable', 'date_format:Y-m-d'],
            'fim' => ['nullable', 'date_format:Y-m-d'],
        ];
    }
}

