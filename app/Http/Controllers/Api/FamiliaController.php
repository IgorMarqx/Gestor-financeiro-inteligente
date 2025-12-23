<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Familia\AddFamiliaMembroRequest;
use App\Http\Requests\Familia\StoreFamiliaRequest;
use App\Http\Requests\Familia\UpdateFamiliaRequest;
use App\Services\FamiliaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FamiliaController extends ApiController
{
    public function __construct(private readonly FamiliaService $service) {}

    public function show(Request $request): JsonResponse
    {
        $familia = $this->service->getByUser($request->user());

        return $this->apiSuccess($familia, 'OK');
    }

    public function store(StoreFamiliaRequest $request): JsonResponse
    {
        $familia = $this->service->create($request->user(), $request->validated());

        return $this->apiSuccess($familia, 'Família criada com sucesso.', 201);
    }

    public function update(UpdateFamiliaRequest $request): JsonResponse
    {
        $familia = $this->service->update($request->user(), $request->validated());
        if (! $familia) {
            return $this->apiError('Família não encontrada.', null, 404);
        }

        return $this->apiSuccess($familia, 'Família atualizada com sucesso.');
    }

    public function destroy(Request $request): JsonResponse
    {
        if (! $this->service->delete($request->user())) {
            return $this->apiError('Família não encontrada.', null, 404);
        }

        return $this->apiSuccess(null, 'Família removida com sucesso.');
    }

    public function addMember(AddFamiliaMembroRequest $request): JsonResponse
    {
        $familia = $this->service->addMember($request->user(), $request->validated());

        return $this->apiSuccess($familia, 'Membro adicionado com sucesso.');
    }

    public function removeMember(Request $request, int $userId): JsonResponse
    {
        if (! $this->service->removeMember($request->user(), $userId)) {
            return $this->apiError('Membro não encontrado.', null, 404);
        }

        return $this->apiSuccess(null, 'Membro removido com sucesso.');
    }
}
