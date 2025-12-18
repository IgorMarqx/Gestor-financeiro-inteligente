<?php

namespace App\Services\CategoriasGastos;

use App\Repositories\CategoriasGastosRepository;
use App\Repositories\CategoriasGastosResumoRepository;
use App\Repositories\OrcamentosCategoriasRepository;
use App\Services\CategoriasGastos\Periodos\CategoriasPeriodo;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CategoriasGastosResumoService
{
    public function __construct(
        private readonly CategoriasGastosRepository $categorias,
        private readonly CategoriasGastosResumoRepository $resumo,
        private readonly OrcamentosCategoriasRepository $orcamentos,
    ) {}

    /**
     * @return array{
     *   periodo: array{inicio:string,fim:string,mes:string|null},
     *   totais: array{gasto_total:string,categorias:int},
     *   categorias: array<int,array{
     *     id:int,
     *     nome:string,
     *     gasto_total:string,
     *     gastos_count:int,
     *     ultima_data:string|null,
     *     participacao_percentual:float,
     *     media_por_gasto:string,
     *     maior_gasto:string,
     *     media_diaria:string,
     *     serie_30d: array<int,string>,
     *     orcamento_limite:string|null,
     *     orcamento_saldo:string|null,
     *     orcamento_percentual:float|null,
     *     status:'sem_orcamento'|'ok'|'alerta80'|'estourou'
     *   }>
     * }
     */
    public function getResumo(int $userId, CategoriasPeriodo $periodo): array
    {
        $categorias = $this->categorias->listByUser($userId, '');
        $gastosByCategoria = $this->resumo
            ->gastosPorCategoria($userId, $periodo->inicio, $periodo->fim)
            ->keyBy('categoria_gasto_id');

        $metricasByCategoria = $this->resumo
            ->metricasPorCategoria($userId, $periodo->inicio, $periodo->fim)
            ->keyBy('categoria_gasto_id');

        $serieRows = $this->resumo->serieDiariaPorCategoria($userId, $periodo->inicio, $periodo->fim, 30);

        $orcamentosByCategoria = $periodo->mes
            ? $this->orcamentos
                ->listByUserAndMes($userId, $periodo->mes)
                ->keyBy('categoria_gasto_id')
            : collect();

        $totalPeriodo = $this->resumo->totalPeriodo($userId, $periodo->inicio, $periodo->fim);
        $totalPeriodoFloat = (float) $totalPeriodo;

        $diasNoPeriodo = Carbon::createFromFormat('Y-m-d', $periodo->inicio)
            ->diffInDays(Carbon::createFromFormat('Y-m-d', $periodo->fim)) + 1;

        $startSerie = Carbon::createFromFormat('Y-m-d', $periodo->fim)->subDays(29)->toDateString();
        $serieInicio = $periodo->inicio > $startSerie ? $periodo->inicio : $startSerie;
        $serieInicioCarbon = Carbon::createFromFormat('Y-m-d', $serieInicio);
        $serieFimCarbon = Carbon::createFromFormat('Y-m-d', $periodo->fim);
        $serieDays = $serieInicioCarbon->diffInDays($serieFimCarbon) + 1;

        $serieByCategoria = $serieRows
            ->groupBy('categoria_gasto_id')
            ->map(function (Collection $rows) use ($serieInicioCarbon, $serieDays) {
                $map = $rows->keyBy('data');
                $serie = [];
                for ($i = 0; $i < $serieDays; $i++) {
                    $d = $serieInicioCarbon->copy()->addDays($i)->toDateString();
                    $serie[] = (string) (($map->get($d)['total'] ?? null) ?? '0');
                }
                return $serie;
            });

        $zeroSerie = array_fill(0, $serieDays, '0');

        $categoriasResumo = $categorias->map(function ($categoria) use ($gastosByCategoria, $orcamentosByCategoria, $metricasByCategoria, $serieByCategoria, $totalPeriodoFloat, $diasNoPeriodo, $zeroSerie) {
            $catId = (int) $categoria->id;
            $gastoRow = $gastosByCategoria->get($catId);
            $total = (string) ($gastoRow['total'] ?? '0');
            $count = (int) ($gastoRow['quantidade'] ?? 0);
            $ultimaData = $gastoRow['ultima_data'] ?? null;

            $metricas = $metricasByCategoria->get($catId);
            $mediaPorGasto = (string) (($metricas['media_por_gasto'] ?? null) ?? '0');
            $maiorGasto = (string) (($metricas['maior_gasto'] ?? null) ?? '0');
            $mediaDiaria = number_format($diasNoPeriodo > 0 ? ((float) $total) / $diasNoPeriodo : 0, 2, '.', '');

            $participacao = $totalPeriodoFloat > 0 ? (((float) $total) / $totalPeriodoFloat) * 100 : 0.0;
            $serie = $serieByCategoria->get($catId) ?? $zeroSerie;

            $orc = $orcamentosByCategoria->get($catId);
            if (! $orc) {
                return [
                    'id' => $catId,
                    'nome' => (string) $categoria->nome,
                    'gasto_total' => $total,
                    'gastos_count' => $count,
                    'ultima_data' => $ultimaData,
                    'participacao_percentual' => round($participacao, 2),
                    'media_por_gasto' => $mediaPorGasto,
                    'maior_gasto' => $maiorGasto,
                    'media_diaria' => $mediaDiaria,
                    'serie_30d' => is_array($serie) ? $serie : $serie->toArray(),
                    'orcamento_limite' => null,
                    'orcamento_saldo' => null,
                    'orcamento_percentual' => null,
                    'status' => 'sem_orcamento',
                ];
            }

            $limiteStr = (string) $orc->limite;
            $limite = (float) $orc->limite;
            $gasto = (float) $total;
            $saldo = $limite - $gasto;
            $percentual = $limite > 0 ? ($gasto / $limite) * 100 : 0.0;

            $status = 'ok';
            if ($limite > 0 && $percentual >= 100) $status = 'estourou';
            elseif ($limite > 0 && $percentual >= 80) $status = 'alerta80';

            return [
                'id' => $catId,
                'nome' => (string) $categoria->nome,
                'gasto_total' => $total,
                'gastos_count' => $count,
                'ultima_data' => $ultimaData,
                'participacao_percentual' => round($participacao, 2),
                'media_por_gasto' => $mediaPorGasto,
                'maior_gasto' => $maiorGasto,
                'media_diaria' => $mediaDiaria,
                'serie_30d' => is_array($serie) ? $serie : $serie->toArray(),
                'orcamento_limite' => $limiteStr,
                'orcamento_saldo' => number_format($saldo, 2, '.', ''),
                'orcamento_percentual' => round($percentual, 2),
                'status' => $status,
            ];
        })->values()->all();

        return [
            'periodo' => [
                'inicio' => $periodo->inicio,
                'fim' => $periodo->fim,
                'mes' => $periodo->mes,
            ],
            'totais' => [
                'gasto_total' => $totalPeriodo,
                'categorias' => $categorias->count(),
            ],
            'categorias' => $categoriasResumo,
        ];
    }
}
