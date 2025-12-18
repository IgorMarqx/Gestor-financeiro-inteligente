<?php

namespace App\Services\CategoriasGastos;

use App\Repositories\CategoriasGastosRepository;
use App\Repositories\GastosRepository;
use App\Services\CategoriasGastos\Periodos\CategoriasPeriodo;
use Illuminate\Support\Collection;

class CategoriasGastosDetalhesService
{
    public function __construct(
        private readonly CategoriasGastosRepository $categorias,
        private readonly GastosRepository $gastos,
    ) {}

    /**
     * @return array{categoria: array{id:int,nome:string}, periodo: array{inicio:string,fim:string,mes:string|null}, gastos: Collection<int, array{id:int,nome:string,valor:string,data:string}>}
     */
    public function gastosPorCategoria(int $userId, int $categoriaId, CategoriasPeriodo $periodo, int $limit = 50): array
    {
        $categoria = $this->categorias->findByIdForUser($categoriaId, $userId);
        if (! $categoria) {
            abort(404, 'Categoria não encontrada.');
        }

        return [
            'categoria' => [
                'id' => (int) $categoria->id,
                'nome' => (string) $categoria->nome,
            ],
            'periodo' => [
                'inicio' => $periodo->inicio,
                'fim' => $periodo->fim,
                'mes' => $periodo->mes,
            ],
            'gastos' => $this->gastos->listResumoByUserCategoriaPeriodo(
                $userId,
                $categoriaId,
                $periodo->inicio,
                $periodo->fim,
                $limit,
            ),
        ];
    }
}

