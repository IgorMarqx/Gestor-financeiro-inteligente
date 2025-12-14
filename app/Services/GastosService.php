<?php

namespace App\Services;

use App\Models\Gasto;
use App\Repositories\GastosRepository;
use Illuminate\Support\Collection;

class GastosService
{
    public function __construct(private readonly GastosRepository $gastos) {}

    /**
     * @param  array{nome:string, valor:numeric-string|float|int, data:string, descricao?:string|null, categoria_gasto_id:int}  $payload
     */
    public function create(int $userId, array $payload): Gasto
    {
        return $this->gastos->create([
            'usuario_id' => $userId,
            'nome' => $payload['nome'],
            'valor' => $payload['valor'],
            'data' => $payload['data'],
            'descricao' => $payload['descricao'] ?? null,
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
     * @param  array{nome:string, valor:numeric-string|float|int, data:string, descricao?:string|null, categoria_gasto_id:int}  $payload
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
                'categoria_gasto_id' => $payload['categoria_gasto_id'],
            ])
            ->load('categoria:id,nome');
    }

    public function delete(int $userId, int $gastoId): bool
    {
        $gasto = $this->gastos->findByIdForUser($gastoId, $userId);
        if (! $gasto) return false;

        $this->gastos->delete($gasto);
        return true;
    }
}
