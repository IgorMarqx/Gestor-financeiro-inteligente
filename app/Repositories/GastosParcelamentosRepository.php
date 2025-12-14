<?php

namespace App\Repositories;

use App\Models\GastoParcelamento;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GastosParcelamentosRepository
{
    public function paginateByUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return GastoParcelamento::query()
            ->with(['categoria:id,nome'])
            ->where('usuario_id', $userId)
            ->orderByDesc('ativo')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function findByIdForUser(int $id, int $userId): ?GastoParcelamento
    {
        return GastoParcelamento::query()
            ->where('id', $id)
            ->where('usuario_id', $userId)
            ->first();
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

