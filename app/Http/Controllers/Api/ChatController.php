<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Chat\ChatConversationRequest;
use App\Http\Requests\Chat\CreateChatRequest;
use App\Http\Requests\Chat\GetConversationRequest;
use App\Http\Requests\Chat\UpdateChatRequest;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class ChatController extends ApiController
{
    public function __construct(private readonly ChatService $chatService) {}

    public function getChats(): JsonResponse
    {
        $userId = (int) auth()->id();
        $familiaId = auth()->user()?->familiaVinculadaId();

        return $this->apiSuccess($this->chatService->listChats($userId, $familiaId), 'OK');
    }

    public function createChat(CreateChatRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $data = $request->validated();

        $chat = $this->chatService->createChat($userId, $data['titulo'] ?? null, $familiaId);

        return $this->apiSuccess($chat, 'Chat criado com sucesso.', 201);
    }

    public function updateChat(UpdateChatRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $data = $request->validated();

        $chat = $this->chatService->updateTitle(
            $userId,
            (int) $data['chat_id'],
            $data['titulo'],
            $familiaId,
        );

        if (! $chat) {
            return $this->apiError('Chat não encontrado.', null, 404);
        }

        return $this->apiSuccess($chat, 'Chat atualizado com sucesso.');
    }

    public function getConversation(GetConversationRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $data = $request->validated();

        $mensagens = $this->chatService->getConversation($userId, (int) $data['chat_id'], $familiaId);

        if ($mensagens === null) {
            return $this->apiError('Chat não encontrado.', null, 404);
        }

        return $this->apiSuccess($mensagens, 'OK');
    }

    public function conversation(ChatConversationRequest $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $familiaId = $request->user()?->familiaVinculadaId();
        $data = $request->validated();

        try {
            $mensagens = $this->chatService->sendMessage(
                $userId,
                (int) $data['chat_id'],
                trim($data['prompt']),
                $familiaId,
            );
        } catch (RuntimeException $exception) {
            return $this->apiError($exception->getMessage(), null, 502);
        }

        if ($mensagens === null) {
            return $this->apiError('Chat não encontrado.', null, 404);
        }

        return $this->apiSuccess($mensagens, 'OK');
    }
}
