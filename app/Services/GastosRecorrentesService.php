<?php

namespace App\Services;

use App\Models\Gasto;
use App\Models\GastoRecorrente;
use App\Repositories\GastosRecorrentesRepository;
use App\Repositories\GastosRepository;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class GastosRecorrentesService
{
    public function __construct(
        private readonly GastosRecorrentesRepository $recorrentes,
        private readonly GastosRepository $gastos,
    ) {}

    public function paginate(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->recorrentes->paginateByUser($userId, $perPage);
    }

    /**
     * @param  array<string,mixed>  $payload
     */
    public function create(int $userId, array $payload): GastoRecorrente
    {
        return $this->recorrentes->create([
            'usuario_id' => $userId,
            'categoria_gasto_id' => (int) $payload['categoria_gasto_id'],
            'nome' => (string) $payload['nome'],
            'descricao' => $payload['descricao'] ?? null,
            'valor' => $payload['valor'],
            'dia_do_mes' => (int) $payload['dia_do_mes'],
            'ativo' => (bool) ($payload['ativo'] ?? true),
            'proxima_data' => (string) $payload['proxima_data'],
            'metodo_pagamento' => $payload['metodo_pagamento'] ?? null,
            'tipo' => $payload['tipo'] ?? null,
            'necessidade' => $payload['necessidade'] ?? null,
        ])->load('categoria:id,nome');
    }

    /**
     * @param  array<string,mixed>  $payload
     */
    public function update(int $userId, int $id, array $payload): ?GastoRecorrente
    {
        $model = $this->recorrentes->findByIdForUser($id, $userId);
        if (! $model) return null;

        return $this->recorrentes->update($model, [
            'categoria_gasto_id' => (int) $payload['categoria_gasto_id'],
            'nome' => (string) $payload['nome'],
            'descricao' => $payload['descricao'] ?? null,
            'valor' => $payload['valor'],
            'dia_do_mes' => (int) $payload['dia_do_mes'],
            'ativo' => (bool) ($payload['ativo'] ?? $model->ativo),
            'proxima_data' => (string) $payload['proxima_data'],
            'metodo_pagamento' => $payload['metodo_pagamento'] ?? null,
            'tipo' => $payload['tipo'] ?? null,
            'necessidade' => $payload['necessidade'] ?? null,
        ])->load('categoria:id,nome');
    }

    public function delete(int $userId, int $id): bool
    {
        $model = $this->recorrentes->findByIdForUser($id, $userId);
        if (! $model) return false;
        $this->recorrentes->delete($model);
        return true;
    }

    public function setAtivo(int $userId, int $id, bool $ativo): ?GastoRecorrente
    {
        $model = $this->recorrentes->findByIdForUser($id, $userId);
        if (! $model) return null;

        return $this->recorrentes->update($model, ['ativo' => $ativo])->load('categoria:id,nome');
    }

    /**
     * Gera lançamentos vencidos e avança `proxima_data`.
     * @return array{gerados:int}
     */
    public function gerarLancamentos(int $userId, ?string $today = null): array
    {
        $hoje = $today ? Carbon::parse($today) : Carbon::today();
        $due = $this->recorrentes->listDueForGeneration($userId, $hoje->toDateString());

        $gerados = 0;

        DB::transaction(function () use ($due, $hoje, &$gerados) {
            foreach ($due as $rec) {
                $proxima = Carbon::parse($rec->proxima_data);

                while ($proxima->lessThanOrEqualTo($hoje)) {
                    $gasto = $this->gastos->create([
                        'usuario_id' => (int) $rec->usuario_id,
                        'categoria_gasto_id' => (int) $rec->categoria_gasto_id,
                        'nome' => (string) $rec->nome,
                        'descricao' => $rec->descricao,
                        'valor' => $rec->valor,
                        'data' => $proxima->toDateString(),
                        'metodo_pagamento' => $rec->metodo_pagamento,
                        'tipo' => $rec->tipo,
                        'necessidade' => $rec->necessidade,
                        'origem_id' => (int) $rec->id,
                        'origem_tipo' => 'RECORRENTE',
                    ]);
                    unset($gasto);
                    $gerados++;

                    $proxima = $this->addMonthKeepingDay($proxima, (int) $rec->dia_do_mes);
                }

                $rec->forceFill(['proxima_data' => $proxima->toDateString()]);
                $rec->save();
            }
        });

        return ['gerados' => $gerados];
    }

    private function addMonthKeepingDay(Carbon $date, int $dayOfMonth): Carbon
    {
        $next = $date->copy()->addMonthNoOverflow()->startOfMonth();
        $lastDay = $next->copy()->endOfMonth()->day;
        $targetDay = max(1, min($dayOfMonth, $lastDay));
        return $next->setDay($targetDay);
    }
}

