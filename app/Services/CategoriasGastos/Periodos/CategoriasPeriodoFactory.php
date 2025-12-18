<?php

namespace App\Services\CategoriasGastos\Periodos;

use Carbon\Carbon;

class CategoriasPeriodoFactory
{
    public function fromMes(?string $mes): CategoriasPeriodo
    {
        $useMes = $mes ?: now()->format('Y-m');

        $inicio = Carbon::createFromFormat('Y-m', $useMes)->startOfMonth()->toDateString();
        $fim = Carbon::createFromFormat('Y-m', $useMes)->endOfMonth()->toDateString();

        return new CategoriasPeriodo($inicio, $fim, $useMes);
    }

    public function fromInicioFim(?string $inicio, ?string $fim): CategoriasPeriodo
    {
        if (! $inicio || ! $fim) {
            return $this->fromMes(null);
        }

        $inicioDate = Carbon::createFromFormat('Y-m-d', $inicio)->toDateString();
        $fimDate = Carbon::createFromFormat('Y-m-d', $fim)->toDateString();

        return new CategoriasPeriodo($inicioDate, $fimDate, null);
    }
}

