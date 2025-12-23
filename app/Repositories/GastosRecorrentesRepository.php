<?php

namespace App\Repositories;

use App\Models\GastoRecorrente;
use App\Support\FamiliaScope;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class GastosRecorrentesRepository
{
    public function paginateByUser(int $userId, ?int $familiaId = null, int $perPage = 15): LengthAwarePaginator
    {
        $builder = GastoRecorrente::query()->with(['categoria:id,nome']);
        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder
            ->orderByDesc('ativo')
            ->orderBy('proxima_data')
            ->paginate($perPage);
    }

    public function findByIdForUser(int $id, int $userId, ?int $familiaId = null): ?GastoRecorrente
    {
        $builder = GastoRecorrente::query()->where('id', $id);
        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder->first();
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
    public function listDueForGeneration(int $userId, ?int $familiaId, string $today): Collection
    {
        $builder = GastoRecorrente::query()
            ->where('ativo', 1)
            ->whereDate('proxima_data', '<=', $today);

        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder
            ->orderBy('proxima_data')
            ->get();
    }
}
