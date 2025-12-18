<?php

namespace App\Repositories;

use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class CategoriasGastosResumoRepository
{
    /**
     * @return Collection<int,array{categoria_gasto_id:int,total:string,quantidade:int,ultima_data:string|null}>
     */
    public function gastosPorCategoria(int $userId, string $inicio, string $fim): Collection
    {
        return collect(
            DB::table('gastos')
                ->where('gastos.usuario_id', $userId)
                ->whereNull('gastos.deletado_em')
                ->whereDate('gastos.data', '>=', $inicio)
                ->whereDate('gastos.data', '<=', $fim)
                ->groupBy('gastos.categoria_gasto_id')
                ->orderByDesc(DB::raw('SUM(gastos.valor)'))
                ->get([
                    'gastos.categoria_gasto_id as categoria_gasto_id',
                    DB::raw('SUM(gastos.valor) as total'),
                    DB::raw('COUNT(*) as quantidade'),
                    DB::raw('MAX(gastos.data) as ultima_data'),
                ])
                ->map(fn($row) => [
                    'categoria_gasto_id' => (int) $row->categoria_gasto_id,
                    'total' => (string) $row->total,
                    'quantidade' => (int) $row->quantidade,
                    'ultima_data' => $row->ultima_data ? (string) $row->ultima_data : null,
                ])
                ->all(),
        );
    }

    public function totalPeriodo(int $userId, string $inicio, string $fim): string
    {
        return (string) (DB::table('gastos')
            ->where('gastos.usuario_id', $userId)
            ->whereNull('gastos.deletado_em')
            ->whereDate('gastos.data', '>=', $inicio)
            ->whereDate('gastos.data', '<=', $fim)
            ->sum('gastos.valor') ?? '0');
    }

    /**
     * @return Collection<int,array{categoria_gasto_id:int,media_por_gasto:string,maior_gasto:string}>
     */
    public function metricasPorCategoria(int $userId, string $inicio, string $fim): Collection
    {
        return collect(
            DB::table('gastos')
                ->where('gastos.usuario_id', $userId)
                ->whereNull('gastos.deletado_em')
                ->whereDate('gastos.data', '>=', $inicio)
                ->whereDate('gastos.data', '<=', $fim)
                ->groupBy('gastos.categoria_gasto_id')
                ->get([
                    'gastos.categoria_gasto_id as categoria_gasto_id',
                    DB::raw('AVG(gastos.valor) as media_por_gasto'),
                    DB::raw('MAX(gastos.valor) as maior_gasto'),
                ])
                ->map(fn($row) => [
                    'categoria_gasto_id' => (int) $row->categoria_gasto_id,
                    'media_por_gasto' => (string) $row->media_por_gasto,
                    'maior_gasto' => (string) $row->maior_gasto,
                ])
                ->all(),
        );
    }

    /**
     * @return Collection<int,array{categoria_gasto_id:int,data:string,total:string}>
     */
    public function serieDiariaPorCategoria(int $userId, string $inicio, string $fim, int $days = 30): Collection
    {
        $days = max(7, min(60, $days));
        $start = Carbon::createFromFormat('Y-m-d', $fim)->subDays($days - 1)->toDateString();
        $from = $inicio > $start ? $inicio : $start;

        return collect(
            DB::table('gastos')
                ->where('gastos.usuario_id', $userId)
                ->whereNull('gastos.deletado_em')
                ->whereDate('gastos.data', '>=', $from)
                ->whereDate('gastos.data', '<=', $fim)
                ->groupBy('gastos.categoria_gasto_id', 'gastos.data')
                ->orderBy('gastos.data')
                ->get([
                    'gastos.categoria_gasto_id as categoria_gasto_id',
                    'gastos.data as data',
                    DB::raw('SUM(gastos.valor) as total'),
                ])
                ->map(fn($row) => [
                    'categoria_gasto_id' => (int) $row->categoria_gasto_id,
                    'data' => (string) $row->data,
                    'total' => (string) $row->total,
                ])
                ->all(),
        );
    }
}
