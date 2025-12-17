<?php

namespace App\Http\Controllers\Api;

use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends ApiController
{
    public function __construct(private readonly ChatService $service) {}

    public function getChats(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $chats = $this->service->listChats($userId);

        return $this->apiSuccess($chats->values());
    }

    public function getConversation(Request $request): JsonResponse
    {
        $data = $request->validate([
            'chat_id' => ['required', 'integer'],
        ]);

        $userId = (int) $request->user()->id;
        $mensagens = $this->service->getConversation($userId, (int) $data['chat_id']);
        if ($mensagens->isEmpty()) return $this->apiError('Chat não encontrado.', null, 404);

        return $this->apiSuccess($mensagens->values());
    }

    public function createChat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'titulo' => ['nullable', 'string', 'max:120'],
        ]);

        $userId = (int) $request->user()->id;
        $chat = $this->service->createChat($userId, $data['titulo'] ?? null);

        return $this->apiSuccess($chat, 'Chat criado.', 201);
    }

    public function updateChat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'chat_id' => ['required', 'integer'],
            'titulo' => ['required', 'string', 'max:120'],
        ]);

        $userId = (int) $request->user()->id;
        $chat = $this->service->updateChatTitle($userId, (int) $data['chat_id'], (string) $data['titulo']);
        if (! $chat) return $this->apiError('Chat não encontrado.', null, 404);

        return $this->apiSuccess($chat, 'Chat atualizado.');
    }

    public function deleteChat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'chat_id' => ['required', 'integer'],
        ]);

        $userId = (int) $request->user()->id;
        $ok = $this->service->deleteChat($userId, (int) $data['chat_id']);
        if (! $ok) return $this->apiError('Chat não encontrado.', null, 404);

        return $this->apiSuccess(true, 'Chat removido.');
    }

    public function conversation(Request $request): JsonResponse
    {
        $data = $request->validate([
            'chat_id' => ['required', 'integer'],
            'prompt' => ['required', 'string'],
        ]);

        $userId = (int) $request->user()->id;
        $mensagens = $this->service->conversation($userId, (int) $data['chat_id'], (string) $data['prompt']);
        if ($mensagens->isEmpty()) return $this->apiError('Chat não encontrado.', null, 404);

        return $this->apiSuccess($mensagens->values());
    }
}
