<?php

namespace App\Repositories;

use App\Models\Chat;
use Illuminate\Support\Collection;

class ChatsRepository
{
    /**
     * @return Collection<int, Chat>
     */
    public function listByUser(int $userId): Collection
    {
        return Chat::query()
            ->where('usuario_id', $userId)
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * @param  array{usuario_id:int,titulo?:string|null,contexto?:mixed|null}  $data
     */
    public function create(array $data): Chat
    {
        return Chat::query()->create($data);
    }

    public function findByIdForUser(int $chatId, int $userId): ?Chat
    {
        return Chat::query()
            ->where('id', $chatId)
            ->where('usuario_id', $userId)
            ->first();
    }

    /**
     * @param  array{titulo?:string|null,contexto?:mixed|null}  $data
     */
    public function update(Chat $chat, array $data): Chat
    {
        $chat->fill($data);
        $chat->save();
        return $chat;
    }

    public function delete(Chat $chat): void
    {
        $chat->delete();
    }
}
