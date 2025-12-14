<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Gastos\StoreGastoRequest;
use App\Http\Requests\Gastos\UpdateGastoRequest;
use App\Services\GastosService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GastosController extends Controller
{
    public function __construct(private readonly GastosService $gastosService) {}

    public function index(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;

        return response()->json([
            'data' => $this->gastosService->list($userId),
        ]);
    }

    public function store(StoreGastoRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $gasto = $this->gastosService->create($userId, $request->validated());

        return response()->json([
            'message' => 'Gasto criado com sucesso.',
            'data' => $gasto,
        ], 201);
    }

    public function update(UpdateGastoRequest $request, int $gasto): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $updated = $this->gastosService->update($userId, $gasto, $request->validated());

        if (! $updated) {
            return response()->json(['message' => 'Gasto não encontrado.'], 404);
        }

        return response()->json([
            'message' => 'Gasto atualizado com sucesso.',
            'data' => $updated,
        ]);
    }

    public function destroy(Request $request, int $gasto): JsonResponse
    {
        $userId = (int) $request->user()->id;

        if (! $this->gastosService->delete($userId, $gasto)) {
            return response()->json(['message' => 'Gasto não encontrado.'], 404);
        }

        return response()->json([
            'message' => 'Gasto removido com sucesso.',
        ]);
    }
}
