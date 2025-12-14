<?php

namespace App\Services;

use App\Models\CategoriaGasto;
use App\Repositories\CategoriasGastosRepository;
use Illuminate\Support\Collection;

class CategoriasGastosService
{
    public function __construct(private readonly CategoriasGastosRepository $categoriasGastos) {}

    /**
     * @param  array{nome:string}  $payload
     */
    public function create(int $userId, array $payload): CategoriaGasto
    {
        return $this->categoriasGastos->create([
            'usuario_id' => $userId,
            'nome' => $payload['nome'],
        ]);
    }

    /**
     * @return Collection<int, CategoriaGasto>
     */
    public function list(int $userId, string $query = ''): Collection
    {
        return $this->categoriasGastos->listByUser($userId, $query);
    }
}

