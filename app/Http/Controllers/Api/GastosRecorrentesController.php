<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\GastosRecorrentes\StoreGastoRecorrenteRequest;
use App\Http\Requests\GastosRecorrentes\UpdateGastoRecorrenteRequest;
use App\Services\GastosRecorrentesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GastosRecorrentesController extends ApiController
{
    public function __construct(private readonly GastosRecorrentesService $service) {}

    public function index(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $perPage = (int) $request->query('per_page', 15);

        $paginator = $this->service->paginate($userId, $perPage);

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

    public function store(StoreGastoRecorrenteRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $model = $this->service->create($userId, $request->validated());

        return $this->apiSuccess($model, 'Recorrência criada com sucesso.', 201);
    }

    public function update(UpdateGastoRecorrenteRequest $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $model = $this->service->update($userId, $id, $request->validated());
        if (! $model) return $this->apiError('Recorrência não encontrada.', null, 404);

        return $this->apiSuccess($model, 'Recorrência atualizada com sucesso.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        if (! $this->service->delete($userId, $id)) return $this->apiError('Recorrência não encontrada.', null, 404);

        return $this->apiSuccess(null, 'Recorrência removida com sucesso.');
    }

    public function pausar(Request $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $model = $this->service->setAtivo($userId, $id, false);
        if (! $model) return $this->apiError('Recorrência não encontrada.', null, 404);

        return $this->apiSuccess($model, 'Recorrência pausada.');
    }

    public function ativar(Request $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $model = $this->service->setAtivo($userId, $id, true);
        if (! $model) return $this->apiError('Recorrência não encontrada.', null, 404);

        return $this->apiSuccess($model, 'Recorrência ativada.');
    }

    public function gerarLancamentos(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $result = $this->service->gerarLancamentos($userId);

        return $this->apiSuccess($result, 'Geração executada.');
    }
}
