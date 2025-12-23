<?php

namespace App\Repositories;

use App\Models\OrcamentoCategoria;
use App\Support\FamiliaScope;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class OrcamentosCategoriasRepository
{
    public function paginateByUser(int $userId, ?int $familiaId = null, int $perPage = 15): LengthAwarePaginator
    {
        $builder = OrcamentoCategoria::query()->with(['categoria:id,nome']);
        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder
            ->orderByDesc('mes')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function findByIdForUser(int $id, int $userId, ?int $familiaId = null): ?OrcamentoCategoria
    {
        $builder = OrcamentoCategoria::query()->where('id', $id);
        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder->first();
    }

    public function findByUserCategoriaMes(
        int $userId,
        ?int $familiaId,
        int $categoriaId,
        string $mes
    ): ?OrcamentoCategoria
    {
        $builder = OrcamentoCategoria::query()
            ->where('categoria_gasto_id', $categoriaId)
            ->where('mes', $mes);

        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder->first();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): OrcamentoCategoria
    {
        return OrcamentoCategoria::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(OrcamentoCategoria $model, array $data): OrcamentoCategoria
    {
        $model->fill($data);
        $model->save();
        return $model;
    }

    public function delete(OrcamentoCategoria $model): void
    {
        $model->delete();
    }

    /**
     * @return Collection<int, OrcamentoCategoria>
     */
    public function listByUserAndMes(int $userId, ?int $familiaId, string $mes): Collection
    {
        $builder = OrcamentoCategoria::query()
            ->with(['categoria:id,nome'])
            ->where('mes', $mes);

        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder->get();
    }
}
