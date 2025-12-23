<?php

namespace App\Services;

use App\Events\OrcamentoBatchEvent;
use App\Jobs\OrcamentoBatchJob;
use App\Models\OrcamentoCategoria;
use App\Repositories\GastosRepository;
use App\Repositories\OrcamentosCategoriasRepository;
use App\Support\FamiliaScope;
use Carbon\Carbon;
use Illuminate\Bus\Batch;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;

class OrcamentosCategoriasService
{
    public function __construct(
        private readonly OrcamentosCategoriasRepository $orcamentos,
        private readonly GastosRepository $gastos,
    ) {}

    public function paginate(int $userId, int $perPage = 15, ?int $familiaId = null): LengthAwarePaginator
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        return $this->orcamentos->paginateByUser($userId, $familiaId, $perPage);
    }

    /**
     * @param  array<string,mixed>  $payload
     */
    public function create(int $userId, array $payload, ?int $familiaId = null): OrcamentoCategoria
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);

        return $this->orcamentos->create([
            'usuario_id' => $userId,
            'familia_id' => $familiaId,
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
    public function upsert(int $userId, array $payload, ?int $familiaId = null): OrcamentoCategoria
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $categoriaId = (int) $payload['categoria_gasto_id'];
        $mes = (string) $payload['mes'];
        $limite = $payload['limite'];

        $existing = $this->orcamentos->findByUserCategoriaMes($userId, $familiaId, $categoriaId, $mes);
        if (! $existing) {
            return $this->create($userId, [
                'categoria_gasto_id' => $categoriaId,
                'mes' => $mes,
                'limite' => $limite,
                'alerta_80_enviado' => false,
                'alerta_100_enviado' => false,
            ], $familiaId);
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

    public function deleteByCategoriaMes(
        int $userId,
        int $categoriaId,
        string $mes,
        ?int $familiaId = null
    ): bool
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $existing = $this->orcamentos->findByUserCategoriaMes($userId, $familiaId, $categoriaId, $mes);
        if (! $existing) return false;
        $this->orcamentos->delete($existing);
        return true;
    }

    /**
     * @param  array<string,mixed>  $payload
     * @return array{updated:int}
     */
    public function batchUpsert(int $userId, array $payload, ?int $familiaId = null): array
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $categoriaId = (int) $payload['categoria_gasto_id'];
        $categoriaNome = (string) $payload['categoriaNome'];
        $meses = collect($payload['meses'] ?? [])
            ->map(fn($m) => (string) $m)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $limite = $payload['limite'];

        if (count($meses) === 0) return ['updated' => 0];

        $now = now();

        $rows = array_map(function (string $mes) use ($userId, $familiaId, $categoriaId, $limite, $now) {
            return [
                'usuario_id' => $userId,
                'familia_id' => $familiaId,
                'categoria_gasto_id' => $categoriaId,
                'mes' => $mes,
                'limite' => $limite,
                'alerta_80_enviado' => 0,
                'alerta_100_enviado' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }, $meses);

        Bus::batch([new OrcamentoBatchJob($rows)])
            ->then(function (Batch $batch) use ($userId, $meses, $categoriaNome, $limite) {
                event(new OrcamentoBatchEvent($userId, $batch->id, $meses, $categoriaNome, $limite));
            })
            ->catch(function (Batch $batch) use ($userId, $meses, $categoriaNome, $limite) {
                event(new OrcamentoBatchEvent($userId, $batch->id, $meses, $categoriaNome, $limite));
            })->dispatch();

        return ['message' => 'Operação em segundo plano iniciada. Os orçamentos serão atualizados em breve. E você receberá uma notificação quando o processo for concluído.'];
    }

    /**
     * @param  array<string,mixed>  $payload
     */
    public function update(int $userId, int $id, array $payload, ?int $familiaId = null): ?OrcamentoCategoria
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $model = $this->orcamentos->findByIdForUser($id, $userId, $familiaId);
        if (! $model) return null;

        return $this->orcamentos->update($model, [
            'categoria_gasto_id' => (int) $payload['categoria_gasto_id'],
            'mes' => (string) $payload['mes'],
            'limite' => $payload['limite'],
            'alerta_80_enviado' => (bool) ($payload['alerta_80_enviado'] ?? $model->alerta_80_enviado),
            'alerta_100_enviado' => (bool) ($payload['alerta_100_enviado'] ?? $model->alerta_100_enviado),
        ])->load('categoria:id,nome');
    }

    public function delete(int $userId, int $id, ?int $familiaId = null): bool
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $model = $this->orcamentos->findByIdForUser($id, $userId, $familiaId);
        if (! $model) return false;
        $this->orcamentos->delete($model);
        return true;
    }

    /**
     * @return array<int,array{categoria_gasto_id:int,categoria_nome:string,limite:string,gasto_atual:string,percentual:float,status:'ok'|'alerta80'|'estourou'}>
     */
    public function resumo(int $userId, string $mes, ?int $familiaId = null): array
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $inicio = Carbon::createFromFormat('Y-m', $mes)->startOfMonth()->toDateString();
        $fim = Carbon::createFromFormat('Y-m', $mes)->endOfMonth()->toDateString();

        $orcamentos = $this->orcamentos->listByUserAndMes($userId, $familiaId, $mes);

        $summary = $this->gastos->paginateWithSummary($userId, [
            'inicio' => $inicio,
            'fim' => $fim,
            'per_page' => 1,
        ], $familiaId);
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
