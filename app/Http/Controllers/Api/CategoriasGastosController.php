<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\CategoriasGastos\StoreCategoriaGastoRequest;
use App\Http\Requests\CategoriasGastos\ResumoCategoriasGastosRequest;
use App\Http\Requests\CategoriasGastos\ListarGastosCategoriaRequest;
use App\Http\Requests\CategoriasGastos\UpdateCategoriaGastoRequest;
use App\Services\CategoriasGastosService;
use App\Services\CategoriasGastos\CategoriasGastosResumoService;
use App\Services\CategoriasGastos\CategoriasGastosDetalhesService;
use App\Services\CategoriasGastos\Periodos\CategoriasPeriodoFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoriasGastosController extends ApiController
{
    public function __construct(
        private readonly CategoriasGastosService $categoriasGastosService,
        private readonly CategoriasGastosResumoService $categoriasGastosResumoService,
        private readonly CategoriasGastosDetalhesService $categoriasGastosDetalhesService,
        private readonly CategoriasPeriodoFactory $periodoFactory,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $query = (string) $request->query('q', '');

        return $this->apiSuccess(
            data: $this->categoriasGastosService->list($userId, $query, $familiaId),
            message: 'OK',
        );
    }

    public function store(StoreCategoriaGastoRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $categoria = $this->categoriasGastosService->create($userId, $request->validated(), $familiaId);

        return $this->apiSuccess($categoria, 'Categoria criada com sucesso.', 201);
    }

    public function update(UpdateCategoriaGastoRequest $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $categoria = $this->categoriasGastosService->update(
            $userId,
            $id,
            $request->validated(),
            $familiaId,
        );
        if (! $categoria) {
            return $this->apiError('Categoria não encontrada.', 404);
        }

        return $this->apiSuccess($categoria, 'Categoria atualizada com sucesso.', 200);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $ok = $this->categoriasGastosService->delete($userId, $id, $familiaId);
        if (! $ok) {
            return $this->apiError('Categoria não encontrada.', 404);
        }

        return $this->apiSuccess(null, 'Categoria excluída com sucesso.', 200);
    }

    public function resumo(ResumoCategoriasGastosRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $mes = $request->validated('mes');
        $inicio = $request->validated('inicio');
        $fim = $request->validated('fim');

        $periodo = $mes
            ? $this->periodoFactory->fromMes((string) $mes)
            : $this->periodoFactory->fromInicioFim($inicio ? (string) $inicio : null, $fim ? (string) $fim : null);

        return $this->apiSuccess(
            data: $this->categoriasGastosResumoService->getResumo($userId, $periodo, $familiaId),
            message: 'OK',
        );
    }

    public function gastos(ListarGastosCategoriaRequest $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $mes = $request->validated('mes');
        $inicio = $request->validated('inicio');
        $fim = $request->validated('fim');
        $limit = (int) ($request->validated('limit') ?? 50);

        $periodo = $mes
            ? $this->periodoFactory->fromMes((string) $mes)
            : $this->periodoFactory->fromInicioFim($inicio ? (string) $inicio : null, $fim ? (string) $fim : null);

        return $this->apiSuccess(
            data: $this->categoriasGastosDetalhesService->gastosPorCategoria(
                $userId,
                $id,
                $periodo,
                $limit,
                $familiaId,
            ),
            message: 'OK',
        );
    }
}
