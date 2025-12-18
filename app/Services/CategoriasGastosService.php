<?php

namespace App\Services;

use App\Models\CategoriaGasto;
use App\Repositories\CategoriasGastosRepository;
use App\Repositories\GastosRepository;
use Illuminate\Support\Collection;

class CategoriasGastosService
{
    public function __construct(
        private readonly CategoriasGastosRepository $categoriasGastos,
        private readonly GastosRepository $gastos,
    ) {}

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

    /**
     * @param  array{nome:string}  $payload
     */
    public function update(int $userId, int $categoriaId, array $payload): ?CategoriaGasto
    {
        $categoria = $this->categoriasGastos->findByIdForUser($categoriaId, $userId);
        if (! $categoria) return null;

        return $this->categoriasGastos->update($categoria, [
            'nome' => $payload['nome'],
        ]);
    }

    public function delete(int $userId, int $categoriaId): bool
    {
        $categoria = $this->categoriasGastos->findByIdForUser($categoriaId, $userId);
        if (! $categoria) return false;

        $count = $this->gastos->countByUserCategoria($userId, $categoriaId);
        if ($count > 0) {
            abort(422, 'Não é possível excluir uma categoria com gastos.');
        }

        $this->categoriasGastos->delete($categoria);

        return true;
    }
}
