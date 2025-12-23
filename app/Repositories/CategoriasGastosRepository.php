<?php

namespace App\Repositories;

use App\Models\CategoriaGasto;
use App\Support\FamiliaScope;
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
    public function listByUser(int $userId, ?int $familiaId = null, string $query = ''): Collection
    {
        $builder = CategoriaGasto::query()
            ->select(['id', 'nome']);

        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder
            ->when($query !== '', function ($builder) use ($query) {
                $builder->where('nome', 'like', '%'.$query.'%');
            })
            ->orderBy('nome')
            ->get();
    }

    public function findByIdForUser(int $categoriaId, int $userId, ?int $familiaId = null): ?CategoriaGasto
    {
        $builder = CategoriaGasto::query()
            ->select(['id', 'nome'])
            ->where('id', $categoriaId);

        $builder = FamiliaScope::apply($builder, $userId, $familiaId);

        return $builder
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
