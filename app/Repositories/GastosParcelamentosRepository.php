<?php

namespace App\Repositories;

use App\Models\GastoParcelamento;
use App\Support\FamiliaScope;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GastosParcelamentosRepository
{
    public function paginateByUser(int $userId, ?int $familiaId = null, int $perPage = 15): LengthAwarePaginator
    {
        $builder = GastoParcelamento::query()->with(['categoria:id,nome']);
        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder
            ->orderByDesc('ativo')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function findByIdForUser(int $id, int $userId, ?int $familiaId = null): ?GastoParcelamento
    {
        $builder = GastoParcelamento::query()->where('id', $id);
        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder->first();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): GastoParcelamento
    {
        return GastoParcelamento::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(GastoParcelamento $model, array $data): GastoParcelamento
    {
        $model->fill($data);
        $model->save();
        return $model;
    }

    public function delete(GastoParcelamento $model): void
    {
        $model->delete();
    }
}
