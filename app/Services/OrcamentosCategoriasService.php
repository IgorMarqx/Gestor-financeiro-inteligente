<?php

namespace App\Services;

use App\Models\OrcamentoCategoria;
use App\Repositories\GastosRepository;
use App\Repositories\OrcamentosCategoriasRepository;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrcamentosCategoriasService
{
    public function __construct(
        private readonly OrcamentosCategoriasRepository $orcamentos,
        private readonly GastosRepository $gastos,
    ) {}

    public function paginate(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->orcamentos->paginateByUser($userId, $perPage);
    }

    /**
     * @param  array<string,mixed>  $payload
     */
    public function create(int $userId, array $payload): OrcamentoCategoria
    {
        return $this->orcamentos->create([
            'usuario_id' => $userId,
            'categoria_gasto_id' => (int) $payload['categoria_gasto_id'],
            'mes' => (string) $payload['mes'],
            'limite' => $payload['limite'],
            'alerta_80_enviado' => (bool) ($payload['alerta_80_enviado'] ?? false),
            'alerta_100_enviado' => (bool) ($payload['alerta_100_enviado'] ?? false),
        ])->load('categoria:id,nome');
    }

    /**
     * @param  array<string,mixed>  $payload
     */
    public function upsert(int $userId, array $payload): OrcamentoCategoria
    {
        $categoriaId = (int) $payload['categoria_gasto_id'];
        $mes = (string) $payload['mes'];
        $limite = $payload['limite'];

        $existing = $this->orcamentos->findByUserCategoriaMes($userId, $categoriaId, $mes);
        if (! $existing) {
            return $this->create($userId, [
                'categoria_gasto_id' => $categoriaId,
                'mes' => $mes,
                'limite' => $limite,
                'alerta_80_enviado' => false,
                'alerta_100_enviado' => false,
            ]);
        }

        $limiteChanged = (string) $existing->limite !== (string) $limite;

        return $this->orcamentos->update($existing, [
            'categoria_gasto_id' => $categoriaId,
            'mes' => $mes,
            'limite' => $limite,
            'alerta_80_enviado' => $limiteChanged ? false : $existing->alerta_80_enviado,
            'alerta_100_enviado' => $limiteChanged ? false : $existing->alerta_100_enviado,
        ])->load('categoria:id,nome');
    }

    public function deleteByCategoriaMes(int $userId, int $categoriaId, string $mes): bool
    {
        $existing = $this->orcamentos->findByUserCategoriaMes($userId, $categoriaId, $mes);
        if (! $existing) return false;
        $this->orcamentos->delete($existing);
        return true;
    }

    /**
     * @param  array<string,mixed>  $payload
     * @return array{updated:int}
     */
    public function batchUpsert(int $userId, array $payload): array
    {
        $categoriaId = (int) $payload['categoria_gasto_id'];
        $meses = collect($payload['meses'] ?? [])
            ->map(fn ($m) => (string) $m)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $limite = $payload['limite'];

        if (count($meses) === 0) return ['updated' => 0];

        $now = now();

        $rows = array_map(function (string $mes) use ($userId, $categoriaId, $limite, $now) {
            return [
                'usuario_id' => $userId,
                'categoria_gasto_id' => $categoriaId,
                'mes' => $mes,
                'limite' => $limite,
                'alerta_80_enviado' => 0,
                'alerta_100_enviado' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }, $meses);

        DB::transaction(function () use ($rows) {
            OrcamentoCategoria::query()->upsert(
                $rows,
                ['usuario_id', 'categoria_gasto_id', 'mes'],
                ['limite', 'alerta_80_enviado', 'alerta_100_enviado', 'updated_at'],
            );
        });

        return ['updated' => count($rows)];
    }

    /**
     * @param  array<string,mixed>  $payload
     */
    public function update(int $userId, int $id, array $payload): ?OrcamentoCategoria
    {
        $model = $this->orcamentos->findByIdForUser($id, $userId);
        if (! $model) return null;

        return $this->orcamentos->update($model, [
            'categoria_gasto_id' => (int) $payload['categoria_gasto_id'],
            'mes' => (string) $payload['mes'],
            'limite' => $payload['limite'],
            'alerta_80_enviado' => (bool) ($payload['alerta_80_enviado'] ?? $model->alerta_80_enviado),
            'alerta_100_enviado' => (bool) ($payload['alerta_100_enviado'] ?? $model->alerta_100_enviado),
        ])->load('categoria:id,nome');
    }

    public function delete(int $userId, int $id): bool
    {
        $model = $this->orcamentos->findByIdForUser($id, $userId);
        if (! $model) return false;
        $this->orcamentos->delete($model);
        return true;
    }

    /**
     * @return array<int,array{categoria_gasto_id:int,categoria_nome:string,limite:string,gasto_atual:string,percentual:float,status:'ok'|'alerta80'|'estourou'}>
     */
    public function resumo(int $userId, string $mes): array
    {
        $inicio = Carbon::createFromFormat('Y-m', $mes)->startOfMonth()->toDateString();
        $fim = Carbon::createFromFormat('Y-m', $mes)->endOfMonth()->toDateString();

        $orcamentos = $this->orcamentos->listByUserAndMes($userId, $mes);

        $summary = $this->gastos->paginateWithSummary($userId, [
            'inicio' => $inicio,
            'fim' => $fim,
            'per_page' => 1,
        ]);
        $totais = collect($summary['totais_por_categoria'])->keyBy('categoria_gasto_id');

        return $orcamentos->map(function (OrcamentoCategoria $orc) use ($totais) {
            $gastoAtual = (string) (($totais[(int) $orc->categoria_gasto_id]['total'] ?? null) ?? '0');
            $limite = (float) $orc->limite;
            $gasto = (float) $gastoAtual;
            $percentual = $limite > 0 ? ($gasto / $limite) * 100 : 0.0;

            $status = 'ok';
            if ($limite > 0 && $percentual >= 100) $status = 'estourou';
            elseif ($limite > 0 && $percentual >= 80) $status = 'alerta80';

            return [
                'categoria_gasto_id' => (int) $orc->categoria_gasto_id,
                'categoria_nome' => (string) ($orc->categoria?->nome ?? ''),
                'limite' => (string) $orc->limite,
                'gasto_atual' => $gastoAtual,
                'percentual' => round($percentual, 2),
                'status' => $status,
            ];
        })->values()->all();
    }
}
