<?php

namespace App\Repositories;

use App\Models\Chat;
use App\Support\FamiliaScope;
use Illuminate\Support\Collection;

class ChatsRepository
{
    /**
     * @return Collection<int, Chat>
     */
    public function listByUser(int $userId, ?int $familiaId = null): Collection
    {
        $builder = Chat::query();
        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder
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

    public function findByIdForUser(int $chatId, int $userId, ?int $familiaId = null): ?Chat
    {
        $builder = Chat::query()->where('id', $chatId);
        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder->first();
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
