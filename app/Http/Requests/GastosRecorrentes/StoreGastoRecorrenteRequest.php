<?php

namespace App\Http\Requests\GastosRecorrentes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGastoRecorrenteRequest extends FormRequest
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
            'nome' => ['required', 'string', 'max:100'],
            'descricao' => ['nullable', 'string'],
            'valor' => ['required', 'numeric', 'min:0'],
            'dia_do_mes' => ['required', 'integer', 'min:1', 'max:31'],
            'ativo' => ['nullable', 'boolean'],
            'proxima_data' => ['required', 'date'],
            'metodo_pagamento' => ['nullable', Rule::in(['DEBITO', 'CREDITO', 'PIX', 'DINHEIRO'])],
            'tipo' => ['nullable', Rule::in(['FIXO', 'VARIAVEL'])],
            'necessidade' => ['nullable', Rule::in(['ESSENCIAL', 'SUPERFLUO'])],
        ];
    }
}

