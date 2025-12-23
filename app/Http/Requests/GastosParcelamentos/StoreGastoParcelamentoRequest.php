<?php

namespace App\Http\Requests\GastosParcelamentos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGastoParcelamentoRequest extends FormRequest
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
            'nome' => ['required', 'string', 'max:100'],
            'descricao' => ['nullable', 'string'],
            'valor_total' => ['required', 'numeric', 'min:0'],
            'parcelas_total' => ['required', 'integer', 'min:1', 'max:120'],
            'data_inicio' => ['required', 'date'],
            'ativo' => ['nullable', 'boolean'],
            'metodo_pagamento' => ['nullable', Rule::in(['DEBITO', 'CREDITO', 'PIX', 'DINHEIRO'])],
            'tipo' => ['nullable', Rule::in(['FIXO', 'VARIAVEL'])],
            'necessidade' => ['nullable', Rule::in(['ESSENCIAL', 'SUPERFLUO'])],
        ];
    }
}
