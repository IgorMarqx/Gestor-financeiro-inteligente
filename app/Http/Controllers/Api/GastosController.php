<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Gastos\IndexGastosRequest;
use App\Http\Requests\Gastos\StoreGastoRequest;
use App\Http\Requests\Gastos\UpdateGastoRequest;
use App\Http\Requests\Gastos\ValidarGastoRequest;
use App\Services\GastosService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GastosController extends ApiController
{
    public function __construct(private readonly GastosService $gastosService) {}

    public function index(IndexGastosRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;

        return $this->apiSuccess(
            data: $this->gastosService->listWithSummary($userId, $request->validated()),
            message: 'OK',
        );
    }

    public function store(StoreGastoRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $gasto = $this->gastosService->create($userId, $request->validated());

        return $this->apiSuccess($gasto, 'Gasto criado com sucesso.', 201);
    }

    public function update(UpdateGastoRequest $request, int $gasto): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $updated = $this->gastosService->update($userId, $gasto, $request->validated());

        if (! $updated) {
            return $this->apiError('Gasto não encontrado.', null, 404);
        }

        return $this->apiSuccess($updated, 'Gasto atualizado com sucesso.');
    }

    public function destroy(Request $request, int $gasto): JsonResponse
    {
        $userId = (int) $request->user()->id;

        if (! $this->gastosService->delete($userId, $gasto)) {
            return $this->apiError('Gasto não encontrado.', null, 404);
        }

        return $this->apiSuccess(null, 'Gasto removido com sucesso.');
    }

    public function validar(ValidarGastoRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;

        return $this->apiSuccess(
            data: $this->gastosService->validar($userId, $request->validated()),
            message: 'OK',
        );
    }
}
