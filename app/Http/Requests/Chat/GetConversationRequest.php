<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GetConversationRequest extends FormRequest
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
            'chat_id' => [
                'required',
                'integer',
                Rule::exists('chats', 'id')->where(function ($query) use ($userId, $familiaId) {
                    if ($familiaId !== null) {
                        $query->where('familia_id', $familiaId);
                    } else {
                        $query->where('usuario_id', $userId);
                    }
                }),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'chat_id.required' => 'O chat é obrigatório.',
            'chat_id.integer' => 'O chat deve ser um inteiro.',
            'chat_id.exists' => 'Chat não encontrado.',
        ];
    }
}
