<?php

namespace App\Http\Requests\Familia;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddFamiliaMembroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'nome' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'cpf' => ['nullable', 'string', 'max:32', Rule::unique('users', 'cpf')],
            'telefone' => ['nullable', 'string', 'max:32'],
            'senha' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'O campo email é obrigatório.',
            'email.email' => 'O campo email deve ser um endereço de email válido.',
            'cpf.unique' => 'O CPF informado já está em uso por outro usuário.',
        ];
    }
}
