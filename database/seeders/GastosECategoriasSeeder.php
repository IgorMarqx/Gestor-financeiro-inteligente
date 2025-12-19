<?php

namespace Database\Seeders;

use App\Models\CategoriaGasto;
use App\Models\Gasto;
use App\Models\User;
use Illuminate\Database\Seeder;

class GastosECategoriasSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->first();
        if (! $user) {
            $user = User::factory()->create();
        }

        $categoriasExistentes = CategoriaGasto::query()
            ->where('usuario_id', $user->id)
            ->count();

        $categoriasParaCriar = max(0, 25 - $categoriasExistentes);
        if ($categoriasParaCriar > 0) {
            CategoriaGasto::factory()
                ->count($categoriasParaCriar)
                ->create(['usuario_id' => $user->id]);
        }

        $categorias = CategoriaGasto::query()
            ->where('usuario_id', $user->id)
            ->get();

        if ($categorias->isEmpty()) {
            return;
        }

        $gastosPorCategoria = 120; // ~3000 registros no total (25 * 120)

        foreach ($categorias as $categoria) {
            Gasto::factory()
                ->count($gastosPorCategoria)
                ->forCategoria($categoria)
                ->create();
        }
    }
}

