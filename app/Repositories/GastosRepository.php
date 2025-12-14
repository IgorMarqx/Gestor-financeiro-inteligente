<?php

namespace App\Repositories;

use App\Models\Gasto;
use Illuminate\Support\Collection;

class GastosRepository
{
    /**
     * @param  array{usuario_id:int, nome:string, valor:numeric-string|float|int, data:string, descricao?:string|null, categoria_gasto_id:int}  $data
     */
    public function create(array $data): Gasto
    {
        return Gasto::query()->create($data);
    }

    /**
     * @return Collection<int, Gasto>
     */
    public function listByUser(int $userId): Collection
    {
        return Gasto::query()
            ->with(['categoria:id,nome'])
            ->where('usuario_id', $userId)
            ->orderByDesc('data')
            ->orderByDesc('id')
            ->get();
    }

    public function findByIdForUser(int $id, int $userId): ?Gasto
    {
        return Gasto::query()
            ->where('id', $id)
            ->where('usuario_id', $userId)
            ->first();
    }

    /**
     * @param  array{nome:string, valor:numeric-string|float|int, data:string, descricao?:string|null, categoria_gasto_id:int}  $data
     */
    public function update(Gasto $gasto, array $data): Gasto
    {
        $gasto->fill($data);
        $gasto->save();

        return $gasto;
    }

    public function delete(Gasto $gasto): void
    {
        $gasto->delete();
    }
}
