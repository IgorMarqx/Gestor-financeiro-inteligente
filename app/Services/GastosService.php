<?php

namespace App\Services;

use App\Models\Gasto;
use App\Repositories\GastosRepository;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class GastosService
{
    public function __construct(private readonly GastosRepository $gastos) {}

    /**
     * @param  array{
     *   nome:string,
     *   valor:numeric-string|float|int,
     *   data:string,
     *   descricao?:string|null,
     *   categoria_gasto_id:int,
     *   metodo_pagamento?:'DEBITO'|'CREDITO'|'PIX'|'DINHEIRO'|null,
     *   tipo?:'FIXO'|'VARIAVEL'|null,
     *   necessidade?:'ESSENCIAL'|'SUPERFLUO'|null,
     * }  $payload
     */
    public function create(int $userId, array $payload): Gasto
    {
        return $this->gastos->create([
            'usuario_id' => $userId,
            'nome' => $payload['nome'],
            'valor' => $payload['valor'],
            'data' => $payload['data'],
            'descricao' => $payload['descricao'] ?? null,
            'metodo_pagamento' => $payload['metodo_pagamento'] ?? null,
            'tipo' => $payload['tipo'] ?? null,
            'necessidade' => $payload['necessidade'] ?? null,
            'categoria_gasto_id' => $payload['categoria_gasto_id'],
        ])->load('categoria:id,nome');
    }

    /**
     * @return Collection<int, Gasto>
     */
    public function list(int $userId): Collection
    {
        return $this->gastos->listByUser($userId);
    }

    /**
     * @param  array{
     *   nome:string,
     *   valor:numeric-string|float|int,
     *   data:string,
     *   descricao?:string|null,
     *   categoria_gasto_id:int,
     *   metodo_pagamento?:'DEBITO'|'CREDITO'|'PIX'|'DINHEIRO'|null,
     *   tipo?:'FIXO'|'VARIAVEL'|null,
     *   necessidade?:'ESSENCIAL'|'SUPERFLUO'|null,
     * }  $payload
     */
    public function update(int $userId, int $gastoId, array $payload): ?Gasto
    {
        $gasto = $this->gastos->findByIdForUser($gastoId, $userId);
        if (! $gasto) return null;

        return $this->gastos
            ->update($gasto, [
                'nome' => $payload['nome'],
                'valor' => $payload['valor'],
                'data' => $payload['data'],
                'descricao' => $payload['descricao'] ?? null,
                'metodo_pagamento' => $payload['metodo_pagamento'] ?? null,
                'tipo' => $payload['tipo'] ?? null,
                'necessidade' => $payload['necessidade'] ?? null,
                'categoria_gasto_id' => $payload['categoria_gasto_id'],
            ])
            ->load('categoria:id,nome');
    }

    public function delete(int $userId, int $gastoId): bool
    {
        $gasto = $this->gastos->findByIdForUser($gastoId, $userId);
        if (! $gasto) return false;

        $this->gastos->softDelete($gasto);
        return true;
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
     */
    public function listWithSummary(int $userId, array $filters): array
    {
        $inicio = $filters['inicio'] ?? null;
        $fim = $filters['fim'] ?? null;

        if (! $inicio || ! $fim) {
            $now = Carbon::now();
            $inicio = $inicio ?: $now->copy()->startOfMonth()->toDateString();
            $fim = $fim ?: $now->copy()->endOfMonth()->toDateString();
        }

        $filters['inicio'] = $inicio;
        $filters['fim'] = $fim;

        $result = $this->gastos->paginateWithSummary($userId, $filters);

        return [
            'gastos' => $result['paginator']->items(),
            'paginacao' => [
                'pagina_atual' => $result['paginator']->currentPage(),
                'por_pagina' => $result['paginator']->perPage(),
                'total' => $result['paginator']->total(),
                'ultima_pagina' => $result['paginator']->lastPage(),
            ],
            'total_periodo' => $result['total_periodo'],
            'totais_por_categoria' => $result['totais_por_categoria'],
            'periodo' => ['inicio' => $inicio, 'fim' => $fim],
        ];
    }

    /**
     * @param  array{nome:string,valor:numeric-string|float|int,data:string,categoria_gasto_id:int}  $payload
     */
    public function validar(int $userId, array $payload): array
    {
        $data = Carbon::parse($payload['data']);
        $inicio = $data->copy()->subDays(3)->toDateString();
        $fim = $data->copy()->addDays(3)->toDateString();

        $duplicados = $this->gastos->findPossibleDuplicates(
            userId: $userId,
            nome: $payload['nome'],
            valor: $payload['valor'],
            inicio: $inicio,
            fim: $fim,
            categoriaId: (int) $payload['categoria_gasto_id'],
        );

        $mesInicio = $data->copy()->startOfMonth()->toDateString();
        $mesFim = $data->copy()->endOfMonth()->toDateString();
        $avg = $this->gastos->avgByCategoriaInMonth($userId, (int) $payload['categoria_gasto_id'], $mesInicio, $mesFim);

        $valor = (float) $payload['valor'];
        $suspeito = $avg > 0 && $valor >= (3 * $avg);
        $motivo = null;
        if ($suspeito) {
            $motivo = sprintf('Valor (%.2f) >= 3x a média da categoria no mês (%.2f).', $valor, $avg);
        }

        return [
            'possivel_duplicado' => $duplicados->values(),
            'suspeito' => $suspeito,
            'motivo_texto' => $motivo,
        ];
    }
}
