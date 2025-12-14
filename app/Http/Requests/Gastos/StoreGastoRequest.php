<?php

namespace App\Http\Requests\Gastos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGastoRequest extends FormRequest
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
            'descricao' => ['nullable', 'string'],
            'metodo_pagamento' => ['nullable', Rule::in(['DEBITO', 'CREDITO', 'PIX', 'DINHEIRO'])],
            'tipo' => ['nullable', Rule::in(['FIXO', 'VARIAVEL'])],
            'necessidade' => ['nullable', Rule::in(['ESSENCIAL', 'SUPERFLUO'])],
            'categoria_gasto_id' => [
                'required',
                'integer',
                Rule::exists('categorias_gastos', 'id')->where('usuario_id', $userId),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do gasto é obrigatório.',
            'nome.string' => 'O nome do gasto deve ser uma string.',
            'nome.max' => 'O nome do gasto não pode exceder 100 caracteres.',
            'valor.required' => 'O valor do gasto é obrigatório.',
            'valor.numeric' => 'O valor do gasto deve ser numérico.',
            'valor.min' => 'O valor do gasto deve ser pelo menos 0.',
            'data.required' => 'A data do gasto é obrigatória.',
            'data.date' => 'A data do gasto deve ser uma data válida.',
            'descricao.string' => 'A descrição do gasto deve ser uma string.',
            'categoria_gasto_id.required' => 'A categoria de gasto é obrigatória.',
            'categoria_gasto_id.integer' => 'A categoria de gasto deve ser um inteiro.',
            'categoria_gasto_id.exists' => 'A categoria de gasto selecionada é inválida.',
        ];
    }
}
