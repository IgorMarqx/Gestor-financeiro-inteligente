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
}
