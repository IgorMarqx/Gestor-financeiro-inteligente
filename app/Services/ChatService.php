<?php

namespace App\Services;

use App\Models\Chat;
use App\Repositories\ChatMensagensRepository;
use App\Repositories\ChatsRepository;
use App\Support\FamiliaScope;
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
    public function listChats(int $userId, ?int $familiaId = null): Collection
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        return $this->chatsRepository->listByUser($userId, $familiaId);
    }

    public function createChat(int $userId, ?string $titulo = null, ?int $familiaId = null): Chat
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);

        return $this->chatsRepository->create([
            'usuario_id' => $userId,
            'familia_id' => $familiaId,
            'titulo' => $titulo,
            'contexto' => [],
        ]);
    }

    public function updateTitle(int $userId, int $chatId, string $titulo, ?int $familiaId = null): ?Chat
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $chat = $this->chatsRepository->findByIdForUser($chatId, $userId, $familiaId);
        if (!$chat) {
            return null;
        }

        return $this->chatsRepository->update($chat, ['titulo' => $titulo]);
    }

    /**
     * @return Collection<int, mixed>|null
     */
    public function getConversation(int $userId, int $chatId, ?int $familiaId = null): ?Collection
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $chat = $this->chatsRepository->findByIdForUser($chatId, $userId, $familiaId);
        if (!$chat) {
            return null;
        }

        return $this->chatMensagensRepository->listByChat($chatId);
    }

    /**
     * @return Collection<int, mixed>|null
     */
    public function sendMessage(int $userId, int $chatId, string $prompt, ?int $familiaId = null): ?Collection
    {
        $familiaId = FamiliaScope::resolveFamiliaId($userId, $familiaId);
        $chat = $this->chatsRepository->findByIdForUser($chatId, $userId, $familiaId);
        if (!$chat) {
            return null;
        }

        $this->chatMensagensRepository->create([
            'chat_id' => $chatId,
            'familia_id' => $familiaId,
            'role' => 'user',
            'conteudo' => $prompt,
            'meta' => null,
        ]);
        $chat->touch();

        $mensagens = $this->chatMensagensRepository->listByChat($chatId);
        $contents = $this->buildContents($mensagens);

        $response = $this->geminiService->handlePrompt($prompt, $contents, $userId, $familiaId);
        $assistantText = trim($response['text'] ?? '');
        if ($assistantText === '') {
            throw new RuntimeException('Resposta vazia da IA.');
        }

        $assistantMessage = $this->chatMensagensRepository->create([
            'chat_id' => $chatId,
            'familia_id' => $familiaId,
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
