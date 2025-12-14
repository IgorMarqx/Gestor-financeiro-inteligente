<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Gastos\StoreGastoRequest;
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
}
