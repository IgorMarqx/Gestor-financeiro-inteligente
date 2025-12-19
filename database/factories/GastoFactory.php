<?php

namespace Database\Factories;

use App\Models\CategoriaGasto;
use App\Models\Gasto;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Gasto>
 */
class GastoFactory extends Factory
{
    protected $model = Gasto::class;

    public function definition(): array
    {
        $metodos = ['DEBITO', 'CREDITO', 'PIX', 'DINHEIRO'];
        $tipos = ['FIXO', 'VARIAVEL'];
        $necessidades = ['ESSENCIAL', 'SUPERFLUO'];

        $data = $this->faker->dateTimeBetween('-18 months', 'now');

        return [
            'usuario_id' => User::factory(),
            'nome' => $this->faker->words($this->faker->numberBetween(2, 4), true),
            'valor' => $this->faker->randomFloat(2, 5, 2500),
            'data' => $data->format('Y-m-d'),
            'descricao' => $this->faker->boolean(55) ? $this->faker->sentence() : null,
            'metodo_pagamento' => $this->faker->boolean(85) ? $this->faker->randomElement($metodos) : null,
            'tipo' => $this->faker->boolean(80) ? $this->faker->randomElement($tipos) : null,
            'necessidade' => $this->faker->boolean(80) ? $this->faker->randomElement($necessidades) : null,
            'categoria_gasto_id' => CategoriaGasto::factory(),
            'origem_id' => null,
            'origem_tipo' => null,
            'deletado_em' => null,
        ];
    }

    public function forUser(User $user): self
    {
        return $this->state(fn () => ['usuario_id' => $user->id]);
    }

    public function forCategoria(CategoriaGasto $categoria): self
    {
        return $this->state(fn () => [
            'categoria_gasto_id' => $categoria->id,
            'usuario_id' => $categoria->usuario_id,
        ]);
    }
}

