<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\GastosParcelamentos\StoreGastoParcelamentoRequest;
use App\Http\Requests\GastosParcelamentos\UpdateGastoParcelamentoRequest;
use App\Services\GastosParcelamentosService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GastosParcelamentosController extends ApiController
{
    public function __construct(private readonly GastosParcelamentosService $service) {}

    public function index(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $perPage = (int) $request->query('per_page', 15);
        $paginator = $this->service->paginate($userId, $perPage, $familiaId);

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

    public function store(StoreGastoParcelamentoRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $model = $this->service->create($userId, $request->validated(), $familiaId);

        return $this->apiSuccess($model, 'Parcelamento criado com sucesso.', 201);
    }

    public function update(UpdateGastoParcelamentoRequest $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $model = $this->service->update($userId, $id, $request->validated(), $familiaId);
        if (! $model) return $this->apiError('Parcelamento não encontrado.', null, 404);

        return $this->apiSuccess($model, 'Parcelamento atualizado com sucesso.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        if (! $this->service->delete($userId, $id, $familiaId)) {
            return $this->apiError('Parcelamento não encontrado.', null, 404);
        }

        return $this->apiSuccess(null, 'Parcelamento removido com sucesso.');
    }

    public function pausar(Request $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $model = $this->service->setAtivo($userId, $id, false, $familiaId);
        if (! $model) return $this->apiError('Parcelamento não encontrado.', null, 404);

        return $this->apiSuccess($model, 'Parcelamento pausado.');
    }

    public function ativar(Request $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $model = $this->service->setAtivo($userId, $id, true, $familiaId);
        if (! $model) return $this->apiError('Parcelamento não encontrado.', null, 404);

        return $this->apiSuccess($model, 'Parcelamento ativado.');
    }

    public function gerarParcelas(Request $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $result = $this->service->gerarParcelas($userId, $id, $familiaId);
        if ($result['criadas'] === 0 && $result['ja_existiam'] === false) {
            return $this->apiError('Parcelamento não encontrado.', null, 404);
        }

        return $this->apiSuccess($result, $result['ja_existiam'] ? 'Parcelas já existiam.' : 'Parcelas geradas.');
    }
}
