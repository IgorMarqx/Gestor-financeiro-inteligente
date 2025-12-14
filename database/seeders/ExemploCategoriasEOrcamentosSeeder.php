<?php

namespace Database\Seeders;

use App\Models\CategoriaGasto;
use App\Models\OrcamentoCategoria;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExemploCategoriasEOrcamentosSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->first();
        if (! $user) return;

        $categorias = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer'];
        $mes = now()->format('Y-m');

        foreach ($categorias as $nome) {
            $cat = CategoriaGasto::query()->firstOrCreate(
                ['usuario_id' => $user->id, 'nome' => $nome],
                ['usuario_id' => $user->id, 'nome' => $nome],
            );

            OrcamentoCategoria::query()->firstOrCreate(
                ['usuario_id' => $user->id, 'categoria_gasto_id' => $cat->id, 'mes' => $mes],
                ['limite' => 500, 'alerta_80_enviado' => 0, 'alerta_100_enviado' => 0],
            );
        }
    }
}

