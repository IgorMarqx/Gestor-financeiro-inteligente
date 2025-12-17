<?php

namespace App\Repositories;

use App\Models\ChatMensagem;
use Illuminate\Support\Collection;

class ChatMensagensRepository
{
    public function findById(int $mensagemId): ?ChatMensagem
    {
        return ChatMensagem::query()->where('id', $mensagemId)->first();
    }

    /**
     * @param  array{chat_id:int,role:'system'|'user'|'assistant',conteudo:string,meta?:mixed|null}  $data
     */
    public function create(array $data): ChatMensagem
    {
        return ChatMensagem::query()->create($data);
    }

    /**
     * @return Collection<int, ChatMensagem>
     */
    public function listByChat(int $chatId): Collection
    {
        return ChatMensagem::query()
            ->where('chat_id', $chatId)
            ->orderBy('id')
            ->get();
    }
}
