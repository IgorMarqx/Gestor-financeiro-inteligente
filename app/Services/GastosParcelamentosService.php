<?php

namespace App\Services;

use App\Models\GastoParcelamento;
use App\Repositories\GastosParcelamentosRepository;
use App\Repositories\GastosParcelasRepository;
use App\Repositories\GastosRepository;
use App\Support\FamiliaScope;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class GastosParcelamentosService
{
    public function __construct(
        private readonly GastosParcelamentosRepository $parcelamentos,
        private readonly GastosParcelasRepository $parcelas,
        private readonly GastosRepository $gastos,
    ) {}

    public function paginate(int $userId, int $perPage = 15, ?int $familiaId = null): LengthAwarePaginator
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        return $this->parcelamentos->paginateByUser($userId, $familiaId, $perPage);
    }

    /**
     * @param  array<string,mixed>  $payload
     */
    public function create(int $userId, array $payload, ?int $familiaId = null): GastoParcelamento
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);

        return $this->parcelamentos->create([
            'usuario_id' => $userId,
            'familia_id' => $familiaId,
            'categoria_gasto_id' => (int) $payload['categoria_gasto_id'],
            'nome' => (string) $payload['nome'],
            'descricao' => $payload['descricao'] ?? null,
            'valor_total' => $payload['valor_total'],
            'parcelas_total' => (int) $payload['parcelas_total'],
            'data_inicio' => (string) $payload['data_inicio'],
            'ativo' => (bool) ($payload['ativo'] ?? true),
            'metodo_pagamento' => $payload['metodo_pagamento'] ?? null,
            'tipo' => $payload['tipo'] ?? null,
            'necessidade' => $payload['necessidade'] ?? null,
        ])->load('categoria:id,nome');
    }

    /**
     * @param  array<string,mixed>  $payload
     */
    public function update(int $userId, int $id, array $payload, ?int $familiaId = null): ?GastoParcelamento
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $model = $this->parcelamentos->findByIdForUser($id, $userId, $familiaId);
        if (! $model) return null;

        return $this->parcelamentos->update($model, [
            'categoria_gasto_id' => (int) $payload['categoria_gasto_id'],
            'nome' => (string) $payload['nome'],
            'descricao' => $payload['descricao'] ?? null,
            'valor_total' => $payload['valor_total'],
            'parcelas_total' => (int) $payload['parcelas_total'],
            'data_inicio' => (string) $payload['data_inicio'],
            'ativo' => (bool) ($payload['ativo'] ?? $model->ativo),
            'metodo_pagamento' => $payload['metodo_pagamento'] ?? null,
            'tipo' => $payload['tipo'] ?? null,
            'necessidade' => $payload['necessidade'] ?? null,
        ])->load('categoria:id,nome');
    }

    public function delete(int $userId, int $id, ?int $familiaId = null): bool
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $model = $this->parcelamentos->findByIdForUser($id, $userId, $familiaId);
        if (! $model) return false;
        $this->parcelamentos->delete($model);
        return true;
    }

    public function setAtivo(int $userId, int $id, bool $ativo, ?int $familiaId = null): ?GastoParcelamento
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $model = $this->parcelamentos->findByIdForUser($id, $userId, $familiaId);
        if (! $model) return null;

        return $this->parcelamentos->update($model, ['ativo' => $ativo])->load('categoria:id,nome');
    }

    /**
     * Cria parcelas se ainda não existem.
     * @return array{criadas:int,ja_existiam:bool}
     */
    public function gerarParcelas(int $userId, int $parcelamentoId, ?int $familiaId = null): array
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $parcelamento = $this->parcelamentos->findByIdForUser($parcelamentoId, $userId, $familiaId);
        if (! $parcelamento) {
            return ['criadas' => 0, 'ja_existiam' => false];
        }
        if ($this->parcelas->hasAnyForParcelamento($parcelamentoId)) {
            return ['criadas' => 0, 'ja_existiam' => true];
        }

        $total = (float) $parcelamento->valor_total;
        $n = (int) $parcelamento->parcelas_total;
        $base = floor(($total / $n) * 100) / 100;

        $rows = [];
        $somado = 0.0;
        $inicio = Carbon::parse($parcelamento->data_inicio)->startOfDay();

        for ($i = 1; $i <= $n; $i++) {
            $valor = $base;
            if ($i === $n) {
                $valor = round($total - $somado, 2);
            }
            $somado += $valor;

            $vencimento = $inicio->copy()->addMonthsNoOverflow($i - 1)->toDateString();
            $rows[] = [
                'parcelamento_id' => $parcelamentoId,
                'usuario_id' => $userId,
                'familia_id' => $familiaId,
                'numero_parcela' => $i,
                'valor' => $valor,
                'vencimento' => $vencimento,
                'gasto_id' => null,
                'status' => 'PENDENTE',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::transaction(function () use ($rows) {
            $this->parcelas->insertMany($rows);
        });

        return ['criadas' => $n, 'ja_existiam' => false];
    }

    /**
     * Gera gastos para parcelas vencidas (status=PENDENTE).
     * @return array{gerados:int}
     */
    public function gerarLancamentos(int $userId, ?string $today = null, ?int $familiaId = null): array
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $hoje = $today ? Carbon::parse($today) : Carbon::today();
        $due = $this->parcelas->listDueForGeneration($userId, $familiaId, $hoje->toDateString());

        $gerados = 0;

        DB::transaction(function () use ($due, &$gerados) {
            foreach ($due as $parcela) {
                $parcelamento = $parcela->parcelamento()->first();
                if (! $parcelamento || ! $parcelamento->ativo) continue;

                $gasto = $this->gastos->create([
                    'usuario_id' => (int) $parcelamento->usuario_id,
                    'familia_id' => $familiaId,
                    'categoria_gasto_id' => (int) $parcelamento->categoria_gasto_id,
                    'nome' => (string) $parcelamento->nome,
                    'descricao' => $parcelamento->descricao,
                    'valor' => $parcela->valor,
                    'data' => Carbon::parse($parcela->vencimento)->toDateString(),
                    'metodo_pagamento' => $parcelamento->metodo_pagamento,
                    'tipo' => $parcelamento->tipo,
                    'necessidade' => $parcelamento->necessidade,
                    'origem_id' => (int) $parcela->id,
                    'origem_tipo' => 'PARCELA',
                ]);
                $this->parcelas->markAsGenerated($parcela, (int) $gasto->id);
                $gerados++;
            }
        });

        return ['gerados' => $gerados];
    }
}
