<?php

namespace App\Repositories;

use App\Models\OrcamentoCategoria;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class OrcamentosCategoriasRepository
{
    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return OrcamentoCategoria::query()
            ->with(['categoria:id,nome'])
            ->where('usuario_id', $userId)
            ->orderByDesc('mes')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function findByIdForUser(int $id, int $userId): ?OrcamentoCategoria
    {
        return OrcamentoCategoria::query()
            ->where('id', $id)
            ->where('usuario_id', $userId)
            ->first();
    }

    public function findByUserCategoriaMes(int $userId, int $categoriaId, string $mes): ?OrcamentoCategoria
    {
        return OrcamentoCategoria::query()
            ->where('usuario_id', $userId)
            ->where('categoria_gasto_id', $categoriaId)
            ->where('mes', $mes)
            ->first();
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
    public function listByUserAndMes(int $userId, string $mes): Collection
    {
        return OrcamentoCategoria::query()
            ->with(['categoria:id,nome'])
            ->where('usuario_id', $userId)
            ->where('mes', $mes)
            ->get();
    }
}

