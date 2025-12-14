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
}

