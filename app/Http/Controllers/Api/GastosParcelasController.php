<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\GastosParcelas\IndexGastosParcelasRequest;
use App\Repositories\GastosParcelasRepository;
use App\Services\GastosParcelamentosService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GastosParcelasController extends ApiController
{
    public function __construct(
        private readonly GastosParcelamentosService $service,
        private readonly GastosParcelasRepository $parcelas,
    ) {}

    public function index(IndexGastosParcelasRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $filters = $request->validated();

        $paginator = $this->parcelas->paginateByUser($userId, $familiaId, $filters);

        return $this->apiSuccess([
            'itens' => $paginator->items(),
            'paginacao' => [
                'pagina_atual' => $paginator->currentPage(),
                'por_pagina' => $paginator->perPage(),
                'total' => $paginator->total(),
                'ultima_pagina' => $paginator->lastPage(),
            ],
        ]);
    }

    public function gerarLancamentos(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $result = $this->service->gerarLancamentos($userId, null, $familiaId);

        return $this->apiSuccess($result, 'Geração executada.');
    }
}
