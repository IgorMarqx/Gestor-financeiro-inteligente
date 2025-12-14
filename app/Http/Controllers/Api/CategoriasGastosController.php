<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\CategoriasGastos\StoreCategoriaGastoRequest;
use App\Services\CategoriasGastosService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoriasGastosController extends ApiController
{
    public function __construct(private readonly CategoriasGastosService $categoriasGastosService) {}

    public function index(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $query = (string) $request->query('q', '');

        return $this->apiSuccess(
            data: $this->categoriasGastosService->list($userId, $query),
            message: 'OK',
        );
    }

    public function store(StoreCategoriaGastoRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $categoria = $this->categoriasGastosService->create($userId, $request->validated());

        return $this->apiSuccess($categoria, 'Categoria criada com sucesso.', 201);
    }
}
