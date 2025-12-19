<?php

namespace Database\Factories;

use App\Models\CategoriaGasto;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CategoriaGasto>
 */
class CategoriaGastoFactory extends Factory
{
    protected $model = CategoriaGasto::class;

    public function definition(): array
    {
        $nomes = [
            'Alimentação', 'Restaurantes', 'Mercado', 'Transporte', 'Combustível',
            'Moradia', 'Aluguel', 'Condomínio', 'Água', 'Luz', 'Internet',
            'Saúde', 'Farmácia', 'Academia', 'Educação', 'Cursos',
            'Lazer', 'Viagens', 'Assinaturas', 'Pets', 'Roupas', 'Presentes',
            'Impostos', 'Serviços', 'Manutenção', 'Outros',
        ];

        return [
            'usuario_id' => User::factory(),
            'nome' => $this->faker->unique()->randomElement($nomes),
        ];
    }
}

