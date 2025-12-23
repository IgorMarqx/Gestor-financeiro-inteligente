<?php

namespace App\Http\Requests\Gastos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGastoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = (int) ($this->user()?->id ?? 0);
        $familiaId = $this->user()?->familiaVinculadaId();

        return [
            'nome' => ['required', 'string', 'max:100'],
            'valor' => ['required', 'numeric', 'min:0'],
            'data' => ['required', 'date'],
            'descricao' => ['nullable', 'string'],
            'metodo_pagamento' => ['nullable', Rule::in(['DEBITO', 'CREDITO', 'PIX', 'DINHEIRO'])],
            'tipo' => ['nullable', Rule::in(['FIXO', 'VARIAVEL'])],
            'necessidade' => ['nullable', Rule::in(['ESSENCIAL', 'SUPERFLUO'])],
            'categoria_gasto_id' => [
                'required',
                'integer',
                Rule::exists('categorias_gastos', 'id')->where(function ($query) use ($userId, $familiaId) {
                    if ($familiaId !== null) {
                        $query->where('familia_id', $familiaId);
                    } else {
                        $query->where('usuario_id', $userId);
                    }
                }),
            ],
        ];
    }
}
