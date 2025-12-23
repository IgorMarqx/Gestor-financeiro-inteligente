<?php

namespace App\Repositories;

use App\Models\GastoParcela;
use App\Support\FamiliaScope;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class GastosParcelasRepository
{
    /**
     * @param  array{inicio?:string|null,fim?:string|null,status?:'PENDENTE'|'GERADO'|'PAGO'|null,parcelamento_id?:int|null,per_page?:int|null}  $filters
     */
    public function paginateByUser(int $userId, ?int $familiaId, array $filters): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 15);
        if ($perPage <= 0 || $perPage > 100) $perPage = 15;

        $query = GastoParcela::query()
            ->with(['parcelamento.categoria:id,nome', 'gasto:id,data,valor']);

        $query = FamiliaScope::apply($query, $userId, $familiaId);

        if (! empty($filters['inicio'])) {
            $query->whereDate('vencimento', '>=', (string) $filters['inicio']);
        }
        if (! empty($filters['fim'])) {
            $query->whereDate('vencimento', '<=', (string) $filters['fim']);
        }
        if (! empty($filters['status'])) {
            $query->where('status', (string) $filters['status']);
        }
        if (! empty($filters['parcelamento_id'])) {
            $query->where('parcelamento_id', (int) $filters['parcelamento_id']);
        }

        return $query
            ->orderBy('vencimento')
            ->orderBy('id')
            ->paginate($perPage);
    }

    /**
     * @return Collection<int, GastoParcela>
     */
    public function listByParcelamento(int $parcelamentoId): Collection
    {
        return GastoParcela::query()
            ->where('parcelamento_id', $parcelamentoId)
            ->orderBy('numero_parcela')
            ->get();
    }

    public function hasAnyForParcelamento(int $parcelamentoId): bool
    {
        return GastoParcela::query()
            ->where('parcelamento_id', $parcelamentoId)
            ->exists();
    }

    /**
     * @param  array<int, array<string,mixed>>  $rows
     */
    public function insertMany(array $rows): void
    {
        GastoParcela::query()->insert($rows);
    }

    /**
     * @return Collection<int, GastoParcela>
     */
    public function listDueForGeneration(int $userId, ?int $familiaId, string $today): Collection
    {
        $builder = GastoParcela::query()
            ->whereIn('status', ['PENDENTE'])
            ->whereDate('vencimento', '<=', $today);

        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder
            ->orderBy('vencimento')
            ->get();
    }

    public function markAsGenerated(GastoParcela $parcela, int $gastoId): void
    {
        $parcela->fill([
            'gasto_id' => $gastoId,
            'status' => 'GERADO',
        ]);
        $parcela->save();
    }

    public function findByIdForUser(int $id, int $userId, ?int $familiaId = null): ?GastoParcela
    {
        $builder = GastoParcela::query()->where('id', $id);
        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder->first();
    }
}
