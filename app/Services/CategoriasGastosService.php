<?php

namespace App\Services;

use App\Models\CategoriaGasto;
use App\Repositories\CategoriasGastosRepository;
use App\Repositories\GastosRepository;
use App\Support\FamiliaScope;
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
    public function create(int $userId, array $payload, ?int $familiaId = null): CategoriaGasto
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);

        return $this->categoriasGastos->create([
            'usuario_id' => $userId,
            'familia_id' => $familiaId,
            'nome' => $payload['nome'],
        ]);
    }

    /**
     * @return Collection<int, CategoriaGasto>
     */
    public function list(int $userId, string $query = '', ?int $familiaId = null): Collection
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);

        return $this->categoriasGastos->listByUser($userId, $familiaId, $query);
    }

    /**
     * @param  array{nome:string}  $payload
     */
    public function update(int $userId, int $categoriaId, array $payload, ?int $familiaId = null): ?CategoriaGasto
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $categoria = $this->categoriasGastos->findByIdForUser($categoriaId, $userId, $familiaId);
        if (! $categoria) return null;

        return $this->categoriasGastos->update($categoria, [
            'nome' => $payload['nome'],
        ]);
    }

    public function delete(int $userId, int $categoriaId, ?int $familiaId = null): bool
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $categoria = $this->categoriasGastos->findByIdForUser($categoriaId, $userId, $familiaId);
        if (! $categoria) return false;

        $count = $this->gastos->countByUserCategoria($userId, $familiaId, $categoriaId);
        if ($count > 0) {
            abort(422, 'Não é possível excluir uma categoria com gastos.');
        }

        $this->categoriasGastos->delete($categoria);

        return true;
    }
}
