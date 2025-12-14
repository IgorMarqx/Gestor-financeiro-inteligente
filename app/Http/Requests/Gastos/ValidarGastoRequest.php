<?php

namespace App\Http\Requests\Gastos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ValidarGastoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = (int) ($this->user()?->id ?? 0);

        return [
            'nome' => ['required', 'string', 'max:100'],
            'valor' => ['required', 'numeric', 'min:0'],
            'data' => ['required', 'date'],
            'categoria_gasto_id' => [
                'required',
                'integer',
                Rule::exists('categorias_gastos', 'id')->where('usuario_id', $userId),
            ],
        ];
    }
}

