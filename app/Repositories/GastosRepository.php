<?php

namespace App\Repositories;

use App\Models\Gasto;
use App\Support\FamiliaScope;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

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
    public function listByUser(int $userId, ?int $familiaId = null): Collection
    {
        $builder = Gasto::query()
            ->with(['categoria:id,nome'])
            ->whereNull('deletado_em');

        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder
            ->orderByDesc('data')
            ->orderByDesc('id')
            ->get();
    }

    public function findByIdForUser(int $id, int $userId, ?int $familiaId = null): ?Gasto
    {
        $builder = Gasto::query()
            ->where('id', $id)
            ->whereNull('deletado_em');

        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder->first();
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

    /**
     * Soft delete lógico via `deletado_em`.
     */
    public function softDelete(Gasto $gasto): void
    {
        $gasto->forceFill(['deletado_em' => now()]);
        $gasto->save();
    }

    /**
     * @param  array{
     *   inicio?:string|null,
     *   fim?:string|null,
     *   categoria_gasto_id?:int|null,
     *   valor_min?:numeric-string|float|int|null,
     *   valor_max?:numeric-string|float|int|null,
     *   q?:string|null,
     *   somente_recorrentes?:bool|null,
     *   somente_parcelados?:bool|null,
     *   order_by?:'data'|'valor'|'categoria'|null,
     *   order_dir?:'asc'|'desc'|null,
     *   per_page?:int|null,
     * } $filters
     * @return array{paginator:LengthAwarePaginator,total_periodo:string,totais_por_categoria:array<int,array{categoria_gasto_id:int,categoria_nome:string,total:string}>}
     */
    public function paginateWithSummary(int $userId, ?int $familiaId, array $filters): array
    {
        $perPage = (int) ($filters['per_page'] ?? 15);
        if ($perPage <= 0 || $perPage > 100) $perPage = 15;

        $base = Gasto::query()
            ->with(['categoria:id,nome'])
            ->whereNull('gastos.deletado_em');

        $base = FamiliaScope::apply($base, $userId, $familiaId, 'gastos');
        $base = $this->applyFilters($base, $filters, 'gastos');

        $orderBy = (string) ($filters['order_by'] ?? 'data');
        $orderDir = strtolower((string) ($filters['order_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        if ($orderBy === 'valor') {
            $base->orderBy('valor', $orderDir);
        } elseif ($orderBy === 'categoria') {
            $base->orderBy('categoria_gasto_id', $orderDir);
        } else {
            $base->orderBy('data', $orderDir);
        }
        $base->orderByDesc('id');

        $paginator = $base->paginate($perPage);

        $summaryQuery = Gasto::query()->whereNull('gastos.deletado_em');
        $summaryQuery = FamiliaScope::apply($summaryQuery, $userId, $familiaId, 'gastos');
        $summaryQuery = $this->applyFilters($summaryQuery, $filters, 'gastos');

        $totalPeriodo = (string) ($summaryQuery->clone()->sum('valor') ?? '0');

        $totaisPorCategoria = $summaryQuery->clone()
            ->join('categorias_gastos', 'categorias_gastos.id', '=', 'gastos.categoria_gasto_id')
            ->groupBy('gastos.categoria_gasto_id', 'categorias_gastos.nome')
            ->orderByDesc(DB::raw('SUM(gastos.valor)'))
            ->get([
                'gastos.categoria_gasto_id as categoria_gasto_id',
                'categorias_gastos.nome as categoria_nome',
                DB::raw('SUM(gastos.valor) as total'),
            ])
            ->map(fn ($row) => [
                'categoria_gasto_id' => (int) $row->categoria_gasto_id,
                'categoria_nome' => (string) $row->categoria_nome,
                'total' => (string) $row->total,
            ])
            ->values()
            ->all();

        return [
            'paginator' => $paginator,
            'total_periodo' => $totalPeriodo,
            'totais_por_categoria' => $totaisPorCategoria,
        ];
    }

    /**
     * @return Builder<Gasto>
     */
    private function applyFilters(Builder $query, array $filters, string $tablePrefix = 'gastos'): Builder
    {
        $dataCol = $tablePrefix !== '' ? "{$tablePrefix}.data" : 'data';
        $categoriaCol = $tablePrefix !== '' ? "{$tablePrefix}.categoria_gasto_id" : 'categoria_gasto_id';
        $valorCol = $tablePrefix !== '' ? "{$tablePrefix}.valor" : 'valor';
        $nomeCol = $tablePrefix !== '' ? "{$tablePrefix}.nome" : 'nome';
        $descricaoCol = $tablePrefix !== '' ? "{$tablePrefix}.descricao" : 'descricao';
        $origemTipoCol = $tablePrefix !== '' ? "{$tablePrefix}.origem_tipo" : 'origem_tipo';

        if (! empty($filters['inicio'])) {
            $query->whereDate($dataCol, '>=', (string) $filters['inicio']);
        }
        if (! empty($filters['fim'])) {
            $query->whereDate($dataCol, '<=', (string) $filters['fim']);
        }
        if (! empty($filters['categoria_gasto_id'])) {
            $query->where($categoriaCol, (int) $filters['categoria_gasto_id']);
        }
        if (isset($filters['valor_min']) && $filters['valor_min'] !== null && $filters['valor_min'] !== '') {
            $query->where($valorCol, '>=', $filters['valor_min']);
        }
        if (isset($filters['valor_max']) && $filters['valor_max'] !== null && $filters['valor_max'] !== '') {
            $query->where($valorCol, '<=', $filters['valor_max']);
        }
        $q = trim((string) ($filters['q'] ?? ''));
        if ($q !== '') {
            $query->where(function (Builder $sub) use ($q, $nomeCol, $descricaoCol) {
                $sub->where($nomeCol, 'like', "%{$q}%")
                    ->orWhere($descricaoCol, 'like', "%{$q}%");
            });
        }
        if (! empty($filters['somente_recorrentes'])) {
            $query->where($origemTipoCol, 'RECORRENTE');
        }
        if (! empty($filters['somente_parcelados'])) {
            $query->where($origemTipoCol, 'PARCELA');
        }

        return $query;
    }

    /**
     * @return Collection<int, Gasto>
     */
    public function findPossibleDuplicates(
        int $userId,
        ?int $familiaId,
        string $nome,
        mixed $valor,
        string $inicio,
        string $fim,
        int $categoriaId
    ): Collection
    {
        $q = trim($nome);
        $needle = $q === '' ? '' : mb_substr($q, 0, 25);

        $builder = Gasto::query()
            ->with(['categoria:id,nome'])
            ->whereNull('gastos.deletado_em')
            ->where('gastos.categoria_gasto_id', $categoriaId)
            ->where('gastos.valor', $valor)
            ->whereDate('gastos.data', '>=', $inicio)
            ->whereDate('gastos.data', '<=', $fim)
            ->when($needle !== '', fn (Builder $b) => $b->where('nome', 'like', "%{$needle}%"))
            ->orderByDesc('data')
            ->limit(10)
            ;

        $builder = FamiliaScope::apply($builder, $userId, $familiaId, 'gastos');

        return $builder->get();
    }

    public function avgByCategoriaInMonth(
        int $userId,
        ?int $familiaId,
        int $categoriaId,
        string $inicio,
        string $fim
    ): float
    {
        $builder = Gasto::query()
            ->whereNull('gastos.deletado_em')
            ->where('gastos.categoria_gasto_id', $categoriaId)
            ->whereDate('gastos.data', '>=', $inicio)
            ->whereDate('gastos.data', '<=', $fim);

        $builder = FamiliaScope::apply($builder, $userId, $familiaId, 'gastos');

        return (float) $builder->avg('gastos.valor');
    }

    /**
     * @return Collection<int, array{id:int,nome:string,valor:string,data:string}>
     */
    public function listResumoByUserCategoriaPeriodo(
        int $userId,
        ?int $familiaId,
        int $categoriaId,
        string $inicio,
        string $fim,
        int $limit = 50
    ): Collection
    {
        $limit = max(1, min(100, $limit));

        $builder = Gasto::query()
            ->whereNull('gastos.deletado_em')
            ->where('gastos.categoria_gasto_id', $categoriaId)
            ->whereDate('gastos.data', '>=', $inicio)
            ->whereDate('gastos.data', '<=', $fim);

        $builder = FamiliaScope::apply($builder, $userId, $familiaId, 'gastos');

        return $builder
            ->orderByDesc('gastos.data')
            ->orderByDesc('gastos.id')
            ->limit($limit)
            ->get(['gastos.id', 'gastos.nome', 'gastos.valor', 'gastos.data'])
            ->map(fn (Gasto $g) => [
                'id' => (int) $g->id,
                'nome' => (string) $g->nome,
                'valor' => (string) $g->valor,
                'data' => (string) $g->data?->format('Y-m-d'),
            ]);
    }

    public function countByUserCategoria(int $userId, ?int $familiaId, int $categoriaId): int
    {
        $builder = Gasto::query()
            ->whereNull('gastos.deletado_em')
            ->where('gastos.categoria_gasto_id', $categoriaId);

        $builder = FamiliaScope::apply($builder, $userId, $familiaId, 'gastos');

        return (int) $builder->count();
    }
}
