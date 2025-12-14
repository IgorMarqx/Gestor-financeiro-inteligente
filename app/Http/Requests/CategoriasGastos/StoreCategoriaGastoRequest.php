<?php

namespace App\Http\Requests\CategoriasGastos;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoriaGastoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:100'],
        ];
    }
}

