<?php

namespace App\Http\Requests\OrcamentosCategorias;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BatchUpsertOrcamentoCategoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = (int) ($this->user()?->id ?? 0);

        return [
            'categoria_gasto_id' => [
                'required',
                'integer',
                Rule::exists('categorias_gastos', 'id')->where('usuario_id', $userId),
            ],
            'meses' => ['required', 'array', 'min:1', 'max:240'],
            'meses.*' => ['required', 'regex:/^\\d{4}-\\d{2}$/'],
            'limite' => ['required', 'numeric', 'min:0'],
        ];
    }
}

