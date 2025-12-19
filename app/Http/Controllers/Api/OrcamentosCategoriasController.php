<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\OrcamentosCategorias\BatchUpsertOrcamentoCategoriaRequest;
use App\Http\Requests\OrcamentosCategorias\DestroyOrcamentoCategoriaRequest;
use App\Http\Requests\OrcamentosCategorias\StoreOrcamentoCategoriaRequest;
use App\Http\Requests\OrcamentosCategorias\UpdateOrcamentoCategoriaRequest;
use App\Services\OrcamentosCategoriasService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrcamentosCategoriasController extends ApiController
{
    public function __construct(private readonly OrcamentosCategoriasService $service) {}

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

    public function store(StoreOrcamentoCategoriaRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $model = $this->service->create($userId, $request->validated());

        return $this->apiSuccess($model, 'Orçamento criado com sucesso.', 201);
    }

    public function upsert(StoreOrcamentoCategoriaRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $model = $this->service->upsert($userId, $request->validated());

        return $this->apiSuccess($model, 'Orçamento salvo com sucesso.');
    }

    public function batchUpsert(BatchUpsertOrcamentoCategoriaRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $result = $this->service->batchUpsert($userId, $request->validated());

        return $this->apiSuccess($result, 'Orçamentos salvos com sucesso.');
    }

    public function update(UpdateOrcamentoCategoriaRequest $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $model = $this->service->update($userId, $id, $request->validated());
        if (! $model) return $this->apiError('Orçamento não encontrado.', null, 404);

        return $this->apiSuccess($model, 'Orçamento atualizado com sucesso.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $userId = (int) $request->user()->id;
        if (! $this->service->delete($userId, $id)) return $this->apiError('Orçamento não encontrado.', null, 404);

        return $this->apiSuccess(null, 'Orçamento removido com sucesso.');
    }

    public function destroyByCategoriaMes(DestroyOrcamentoCategoriaRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $payload = $request->validated();
        $categoriaId = (int) $payload['categoria_gasto_id'];
        $mes = (string) $payload['mes'];

        if (! $this->service->deleteByCategoriaMes($userId, $categoriaId, $mes)) {
            return $this->apiError('Orçamento não encontrado.', null, 404);
        }

        return $this->apiSuccess(null, 'Orçamento removido com sucesso.');
    }

    public function resumo(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $mes = (string) $request->query('mes', now()->format('Y-m'));

        return $this->apiSuccess($this->service->resumo($userId, $mes), 'OK');
    }
}
