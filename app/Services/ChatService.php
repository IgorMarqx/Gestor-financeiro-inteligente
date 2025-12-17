<?php

namespace App\Services;

use App\Models\Chat;
use App\Models\ChatMensagem;
use App\Repositories\ChatMensagensRepository;
use App\Repositories\ChatsRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ChatService
{
    public function __construct(
        private readonly ChatsRepository $chats,
        private readonly ChatMensagensRepository $mensagens,
        private readonly OpenAIService $openai,
        private readonly AiDbReadService $aiDb,
    ) {}

    /**
     * @return Collection<int, Chat>
     */
    public function listChats(int $userId): Collection
    {
        return $this->chats->listByUser($userId);
    }

    public function createChat(int $userId, ?string $titulo = null): Chat
    {
        return $this->chats->create([
            'usuario_id' => $userId,
            'titulo' => $titulo ?: 'Novo Chat',
            'contexto' => null,
        ]);
    }

    public function updateChatTitle(int $userId, int $chatId, string $titulo): ?Chat
    {
        $chat = $this->chats->findByIdForUser($chatId, $userId);
        if (! $chat) return null;
        return $this->chats->update($chat, ['titulo' => $titulo]);
    }

    public function deleteChat(int $userId, int $chatId): bool
    {
        $chat = $this->chats->findByIdForUser($chatId, $userId);
        if (! $chat) return false;
        $this->chats->delete($chat);
        return true;
    }

    /**
     * @return Collection<int, ChatMensagem>
     */
    public function getConversation(int $userId, int $chatId): Collection
    {
        $chat = $this->chats->findByIdForUser($chatId, $userId);
        if (! $chat) {
            return collect();
        }

        return $this->mensagens->listByChat($chat->id);
    }

    /**
     * @return Collection<int, ChatMensagem>
     */
    public function conversation(int $userId, int $chatId, string $prompt): Collection
    {
        $chat = $this->chats->findByIdForUser($chatId, $userId);
        if (! $chat) {
            return collect();
        }

        $this->mensagens->create([
            'chat_id' => $chat->id,
            'role' => 'user',
            'conteudo' => $prompt,
            'meta' => null,
        ]);

        $history = $this->mensagens->listByChat($chat->id);

        $aiMessages = $history
            ->map(function (ChatMensagem $m) {
                $role = $m->role;
                if (! in_array($role, ['system', 'user', 'assistant'], true)) $role = 'user';
                return ['role' => $role, 'text' => (string) $m->conteudo];
            })
            ->values()
            ->all();

        $allowedTables = (array) config('ai_db.allowed_tables', []);
        $schemaHint = $allowedTables ? implode(', ', $allowedTables) : '(nenhuma configurada)';

        // Ask OpenAI for an optional read-only SQL query, then execute it safely (SELECT-only + whitelist).
        $dbContext = null;
        try {
            $sqlPlan = $this->openai->generateJsonSchema(
                [
                    [
                        'role' => 'system',
                        'text' => "Você pode consultar o banco APENAS com SELECT (read-only). NUNCA faça INSERT/UPDATE/DELETE/DDL.\n" .
                            "Tabelas permitidas: {$schemaHint}\n" .
                            "Usuário id: {$userId}\n" .
                            "Regras:\n" .
                            "- Sempre filtre pelo usuário quando existir coluna usuario_id.\n" .
                            "- Limite resultados (no máximo " . ((int) config('ai_db.max_rows', 50)) . ").\n",
                    ],
                    ['role' => 'user', 'text' => $prompt],
                ],
                [
                    'type' => 'object',
                    'additionalProperties' => false,
                    'properties' => [
                        'shouldQuery' => ['type' => 'boolean'],
                        'sql' => ['type' => ['string', 'null']],
                        'summary' => ['type' => 'string'],
                    ],
                    'required' => ['shouldQuery', 'sql', 'summary'],
                ],
                'sql_plan',
            );

            $shouldQuery = (bool) ($sqlPlan['shouldQuery'] ?? false);
            $sql = $sqlPlan['sql'] ?? null;
            if ($shouldQuery && is_string($sql) && trim($sql) !== '') {
                $rows = $this->aiDb->select($sql);
                $dbContext = [
                    'summary' => (string) ($sqlPlan['summary'] ?? 'Consulta executada.'),
                    'sql' => $sql,
                    'rows' => $rows,
                ];
            }
        } catch (\Throwable) {
            $dbContext = null;
        }

        if ($dbContext) {
            $aiMessages[] = [
                'role' => 'system',
                'text' => "Contexto do banco (somente leitura):\n" .
                    "Resumo: {$dbContext['summary']}\n" .
                    "SQL: {$dbContext['sql']}\n" .
                    'Linhas: ' . json_encode($dbContext['rows'], JSON_UNESCAPED_UNICODE),
            ];
        }

        try {
            $answer = $this->openai->generateText($aiMessages);
        } catch (\Throwable $e) {
            Log::error('OpenAI conversation failed', [
                'chat_id' => $chat->id,
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'exception' => $e,
            ]);

            $answer = config('app.debug')
                ? 'Falha ao chamar OpenAI: '.$e->getMessage()
                : 'Não consegui gerar uma resposta agora. Tente novamente.';
        }

        $this->mensagens->create([
            'chat_id' => $chat->id,
            'role' => 'assistant',
            'conteudo' => $answer,
            'meta' => null,
        ]);

        return $this->mensagens->listByChat($chat->id);
    }
}
