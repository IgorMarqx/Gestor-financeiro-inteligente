<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoriasGastos\StoreCategoriaGastoRequest;
use App\Services\CategoriasGastosService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoriasGastosController extends Controller
{
    public function __construct(private readonly CategoriasGastosService $categoriasGastosService) {}

    public function index(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $query = (string) $request->query('q', '');

        return response()->json([
            'data' => $this->categoriasGastosService->list($userId, $query),
        ]);
    }

    public function store(StoreCategoriaGastoRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $categoria = $this->categoriasGastosService->create($userId, $request->validated());

        return response()->json([
            'message' => 'Categoria criada com sucesso.',
            'data' => $categoria,
        ], 201);
    }
}

