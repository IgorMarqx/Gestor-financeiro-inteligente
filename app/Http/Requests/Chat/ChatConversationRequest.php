<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChatConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $userId = (int) ($this->user()?->id ?? 0);

        return [
            'chat_id' => [
                'required',
                'integer',
                Rule::exists('chats', 'id')->where('usuario_id', $userId),
            ],
            'prompt' => ['required', 'string', 'max:4000'],
        ];
    }

    public function messages(): array
    {
        return [
            'chat_id.required' => 'O chat é obrigatório.',
            'chat_id.integer' => 'O chat deve ser um inteiro.',
            'chat_id.exists' => 'Chat não encontrado.',
            'prompt.required' => 'A mensagem é obrigatória.',
            'prompt.string' => 'A mensagem deve ser uma string.',
            'prompt.max' => 'A mensagem não pode exceder 4000 caracteres.',
        ];
    }
}
