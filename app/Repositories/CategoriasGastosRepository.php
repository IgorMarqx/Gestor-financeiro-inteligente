<?php

namespace App\Repositories;

use App\Models\CategoriaGasto;
use Illuminate\Support\Collection;

class CategoriasGastosRepository
{
    /**
     * @param  array{usuario_id:int, nome:string}  $data
     */
    public function create(array $data): CategoriaGasto
    {
        return CategoriaGasto::query()->create($data);
    }

    /**
     * @return Collection<int, CategoriaGasto>
     */
    public function listByUser(int $userId, string $query = ''): Collection
    {
        return CategoriaGasto::query()
            ->select(['id', 'nome'])
            ->where('usuario_id', $userId)
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where('nome', 'like', '%'.$query.'%');
            })
            ->orderBy('nome')
            ->get();
    }

    public function findByIdForUser(int $categoriaId, int $userId): ?CategoriaGasto
    {
        return CategoriaGasto::query()
            ->select(['id', 'nome'])
            ->where('id', $categoriaId)
            ->where('usuario_id', $userId)
            ->first();
    }

    public function update(CategoriaGasto $categoria, array $data): CategoriaGasto
    {
        $categoria->fill($data);
        $categoria->save();

        return $categoria;
    }

    public function delete(CategoriaGasto $categoria): void
    {
        $categoria->delete();
    }
}
