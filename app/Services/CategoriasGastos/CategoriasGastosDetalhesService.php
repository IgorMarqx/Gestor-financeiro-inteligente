<?php

namespace App\Services\CategoriasGastos;

use App\Repositories\CategoriasGastosRepository;
use App\Repositories\GastosRepository;
use App\Services\CategoriasGastos\Periodos\CategoriasPeriodo;
use App\Support\FamiliaScope;
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
    public function gastosPorCategoria(
        int $userId,
        int $categoriaId,
        CategoriasPeriodo $periodo,
        int $limit = 50,
        ?int $familiaId = null
    ): array
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $categoria = $this->categorias->findByIdForUser($categoriaId, $userId, $familiaId);
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
                $familiaId,
                $categoriaId,
                $periodo->inicio,
                $periodo->fim,
                $limit,
            ),
        ];
    }
}
