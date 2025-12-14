<?php

namespace App\Repositories;

use App\Models\GastoRecorrente;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class GastosRecorrentesRepository
{
    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return GastoRecorrente::query()
            ->with(['categoria:id,nome'])
            ->where('usuario_id', $userId)
            ->orderByDesc('ativo')
            ->orderBy('proxima_data')
            ->paginate($perPage);
    }

    public function findByIdForUser(int $id, int $userId): ?GastoRecorrente
    {
        return GastoRecorrente::query()
            ->where('id', $id)
            ->where('usuario_id', $userId)
            ->first();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): GastoRecorrente
    {
        return GastoRecorrente::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(GastoRecorrente $model, array $data): GastoRecorrente
    {
        $model->fill($data);
        $model->save();
        return $model;
    }

    public function delete(GastoRecorrente $model): void
    {
        $model->delete();
    }

    /**
     * @return Collection<int, GastoRecorrente>
     */
    public function listDueForGeneration(int $userId, string $today): Collection
    {
        return GastoRecorrente::query()
            ->where('usuario_id', $userId)
            ->where('ativo', 1)
            ->whereDate('proxima_data', '<=', $today)
            ->orderBy('proxima_data')
            ->get();
    }
}

