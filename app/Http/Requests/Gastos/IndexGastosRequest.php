<?php

namespace App\Http\Requests\Gastos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexGastosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'inicio' => ['nullable', 'date'],
            'fim' => ['nullable', 'date', 'after_or_equal:inicio'],
            'categoria_gasto_id' => ['nullable', 'integer', 'min:1'],
            'valor_min' => ['nullable', 'numeric', 'min:0'],
            'valor_max' => ['nullable', 'numeric', 'min:0'],
            'q' => ['nullable', 'string', 'max:100'],
            'somente_recorrentes' => ['nullable', 'boolean'],
            'somente_parcelados' => ['nullable', 'boolean'],
            'order_by' => ['nullable', Rule::in(['data', 'valor', 'categoria'])],
            'order_dir' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}

