<?php

namespace App\Services;

use App\Models\Chat;
use App\Repositories\ChatMensagensRepository;
use App\Repositories\ChatsRepository;
use Illuminate\Support\Collection;
use RuntimeException;

class ChatService
{
    private const HISTORY_LIMIT = 20;

    public function __construct(
        private readonly ChatsRepository $chatsRepository,
        private readonly ChatMensagensRepository $chatMensagensRepository,
        private readonly GeminiService $geminiService,
    ) {
    }

    /**
     * @return Collection<int, Chat>
     */
    public function listChats(int $userId): Collection
    {
        return $this->chatsRepository->listByUser($userId);
    }

    public function createChat(int $userId, ?string $titulo = null): Chat
    {
        return $this->chatsRepository->create([
            'usuario_id' => $userId,
            'titulo' => $titulo,
            'contexto' => [],
        ]);
    }

    public function updateTitle(int $userId, int $chatId, string $titulo): ?Chat
    {
        $chat = $this->chatsRepository->findByIdForUser($chatId, $userId);
        if (!$chat) {
            return null;
        }

        return $this->chatsRepository->update($chat, ['titulo' => $titulo]);
    }

    /**
     * @return Collection<int, mixed>|null
     */
    public function getConversation(int $userId, int $chatId): ?Collection
    {
        $chat = $this->chatsRepository->findByIdForUser($chatId, $userId);
        if (!$chat) {
            return null;
        }

        return $this->chatMensagensRepository->listByChat($chatId);
    }

    /**
     * @return Collection<int, mixed>|null
     */
    public function sendMessage(int $userId, int $chatId, string $prompt): ?Collection
    {
        $chat = $this->chatsRepository->findByIdForUser($chatId, $userId);
        if (!$chat) {
            return null;
        }

        $this->chatMensagensRepository->create([
            'chat_id' => $chatId,
            'role' => 'user',
            'conteudo' => $prompt,
            'meta' => null,
        ]);
        $chat->touch();

        $mensagens = $this->chatMensagensRepository->listByChat($chatId);
        $contents = $this->buildContents($mensagens);

        $response = $this->geminiService->handlePrompt($prompt, $contents, $userId);
        $assistantText = trim($response['text'] ?? '');
        if ($assistantText === '') {
            throw new RuntimeException('Resposta vazia da IA.');
        }

        $assistantMessage = $this->chatMensagensRepository->create([
            'chat_id' => $chatId,
            'role' => 'assistant',
            'conteudo' => $assistantText,
            'meta' => $response['meta'] ?? null,
        ]);

        $contextoAtual = is_array($chat->contexto) ? $chat->contexto : [];
        $contexto = array_merge($contextoAtual, [
            'last_prompt' => $prompt,
            'last_response' => $assistantText,
            'last_message_id' => $assistantMessage->id,
            'last_interaction_at' => now()->toISOString(),
        ]);
        $this->chatsRepository->update($chat, ['contexto' => $contexto]);

        return $this->chatMensagensRepository->listByChat($chatId);
    }

    /**
     * @param  Collection<int, mixed>  $mensagens
     * @return array<int, array{role:string,parts:array<int, array{text:string}>}>
     */
    private function buildContents(Collection $mensagens): array
    {
        $history = $mensagens->slice(-self::HISTORY_LIMIT)->values();

        $contents = [];
        foreach ($history as $mensagem) {
            $role = $mensagem->role === 'assistant' ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [
                    ['text' => $mensagem->conteudo],
                ],
            ];
        }

        return $contents;
    }
}
