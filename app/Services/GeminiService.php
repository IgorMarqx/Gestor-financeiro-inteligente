<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class GeminiService
{
    private const NO_QUERY_TOKEN = 'NO_QUERY';
    /**
     * @param  array<int, array{role:string,parts:array<int, array{text:string}>}>  $historyContents
     * @return array{text:string,meta:array<string, mixed>}
     */
    public function handlePrompt(string $prompt, array $historyContents, int $userId): array
    {
        $sql = $this->generateSql($prompt);
        if ($sql !== self::NO_QUERY_TOKEN) {
            $rows = $this->runQuery($sql, $userId);
            return $this->answerWithData($prompt, $rows, $historyContents);
        }

        return $this->callGemini($historyContents, $this->systemPrompt());
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function runQuery(string $sql, int $userId): array
    {
        $sql = $this->normalizeSql($sql);
        $this->assertSelectOnly($sql);
        $sql = $this->ensureUserFilter($sql);
        $sql = $this->ensureLimit($sql);

        $rows = DB::select($sql, ['user_id' => $userId]);

        return array_map(static fn($row) => (array) $row, $rows);
    }

    private function generateSql(string $prompt): string
    {
        $instruction = implode(' ', [
            'Gere uma consulta SQL (apenas a query) para responder a pergunta do usuário.',
            'Se não precisar de dados do banco, responda exatamente com ' . self::NO_QUERY_TOKEN . '.',
            'Use sintaxe MySQL (não use STRFTIME nem DATE(\'now\')).',
            'Se usar SQL, prefira filtrar por :user_id quando aplicável.',
            'Evite UPDATE, DELETE, INSERT ou qualquer comando que altere dados.',
            'Pergunta do usuário: ' . $prompt,
        ]);

        $response = $this->callGemini([
            [
                'role' => 'user',
                'parts' => [['text' => $instruction]],
            ],
        ], $this->systemPrompt());

        $sql = trim($response['text'] ?? '');
        $sql = preg_replace('/^```(sql)?/i', '', $sql);
        $sql = preg_replace('/```$/', '', $sql);
        $sql = trim($sql);

        return $sql !== '' ? $sql : self::NO_QUERY_TOKEN;
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @param  array<int, array{role:string,parts:array<int, array{text:string}>}>  $historyContents
     * @return array{text:string,meta:array<string, mixed>}
     */
    private function answerWithData(string $prompt, array $rows, array $historyContents): array
    {
        $dataPayload = json_encode($rows, JSON_UNESCAPED_UNICODE);
        $dataPayload = $dataPayload !== false ? $dataPayload : '[]';

        $contents = array_merge($historyContents, [
            [
                'role' => 'user',
                'parts' => [
                    [
                        'text' => implode("\n", [
                            'Dados do banco (JSON):',
                            $dataPayload,
                            'Pergunta do usuário:',
                            $prompt,
                            'Responda com base nesses dados. Se não houver dados, diga que não encontrou registros.',
                        ]),
                    ],
                ],
            ],
        ]);

        return $this->callGemini($contents, $this->systemPrompt());
    }

    /**
     * @param  array<int, array{role:string,parts:array<int, array{text:string}>}>  $contents
     * @return array{text:string,meta:array<string, mixed>}
     */
    private function callGemini(array $contents, string $systemPrompt): array
    {
        $apiKey = config('services.gemini.api_key');
        if (!$apiKey) {
            throw new RuntimeException('GEMINI_API_KEY não configurada.');
        }

        $baseUrl = rtrim((string) config('services.gemini.base_url', ''), '/');
        $model = (string) config('services.gemini.model', 'gemini-2.5-flash-lite');
        $endpoint = $baseUrl . '/models/' . $model . ':generateContent';

        $response = Http::timeout(30)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'X-goog-api-key' => $apiKey,
            ])
            ->post($endpoint, [
                'systemInstruction' => [
                    'parts' => [
                        ['text' => $systemPrompt],
                    ],
                ],
                'contents' => $contents,
            ]);

        if (!$response->ok()) {
            throw new RuntimeException('Falha ao consultar a IA.');
        }

        $payload = $response->json();
        $text = (string) data_get($payload, 'candidates.0.content.parts.0.text', '');
        $finishReason = data_get($payload, 'candidates.0.finishReason');
        $usage = data_get($payload, 'usageMetadata');

        $meta = array_filter([
            'provider' => 'gemini',
            'model' => $model,
            'finish_reason' => $finishReason,
            'usage' => $usage,
        ], static fn($value) => $value !== null);

        return [
            'text' => $text,
            'meta' => $meta,
        ];
    }

    private function systemPrompt(): string
    {
        $allowedTables = $this->allowedTables();
        $schema = $this->schemaSummary();

        return implode("\n", [
            'Você é o assistente do Gestor Financeiro Inteligente.',
            'O sistema ajuda o usuário a analisar finanças pessoais: gastos, receitas, categorias, parcelas, orçamentos e movimentos financeiros.',
            'Responda sempre em português (pt-BR), de forma objetiva e útil.',
            'Tabelas disponíveis: ' . implode(', ', $allowedTables) . '.',
            'Esquema (tabela: colunas): ' . $schema . '.',
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function allowedTables(): array
    {
        $list = (string) env('AI_DB_ALLOWED_TABLES', '');
        $items = array_filter(array_map('trim', explode(',', $list)));
        return array_map('strtolower', $items);
    }

    private function normalizeSql(string $sql): string
    {
        $sql = trim($sql);
        $sql = preg_replace('/\s+/', ' ', $sql) ?? $sql;
        $sql = rtrim($sql, ';');
        $sql = $this->replaceCommonSqliteSyntax($sql);
        return $sql;
    }

    private function assertSelectOnly(string $sql): void
    {
        if (!preg_match('/^select\s/i', $sql)) {
            throw new RuntimeException('Apenas SELECT é permitido.');
        }
    }

    private function ensureUserFilter(string $sql): string
    {
        if (stripos($sql, ':user_id') !== false) {
            return $sql;
        }

        $hasWhere = (bool) preg_match('/\bwhere\b/i', $sql);
        return $this->appendCondition($sql, 'usuario_id = :user_id', $hasWhere);
    }

    private function ensureLimit(string $sql): string
    {
        if (preg_match('/\blimit\s+\d+/i', $sql)) {
            return $sql;
        }

        $limit = (int) env('AI_DB_MAX_ROWS', 50);
        $limit = $limit > 0 ? $limit : 50;

        return rtrim($sql) . ' LIMIT ' . $limit;
    }

    private function appendCondition(string $sql, string $condition, bool $hasWhere): string
    {
        $regex = '/\b(group\s+by|order\s+by|limit)\b/i';
        if (preg_match($regex, $sql, $match, PREG_OFFSET_CAPTURE)) {
            $pos = $match[0][1];
            $before = substr($sql, 0, $pos);
            $after = substr($sql, $pos);
            $glue = $hasWhere ? ' AND ' : ' WHERE ';
            return rtrim($before) . $glue . $condition . ' ' . ltrim($after);
        }

        $glue = $hasWhere ? ' AND ' : ' WHERE ';
        return rtrim($sql) . $glue . $condition;
    }

    private function replaceCommonSqliteSyntax(string $sql): string
    {
        $sql = preg_replace(
            "/STRFTIME\\('%Y-%m'\\s*,\\s*([\\w\\.]+)\\)/i",
            "DATE_FORMAT($1, '%Y-%m')",
            $sql,
        ) ?? $sql;

        $sql = preg_replace(
            "/DATE\\('now'\\s*,\\s*'-1 month'\\)/i",
            "DATE_SUB(CURDATE(), INTERVAL 1 MONTH)",
            $sql,
        ) ?? $sql;

        $sql = preg_replace(
            "/\\bid_user\\b/i",
            'usuario_id',
            $sql,
        ) ?? $sql;

        $sql = preg_replace(
            "/\\bid_usuario\\b/i",
            'usuario_id',
            $sql,
        ) ?? $sql;

        $sql = preg_replace(
            "/\\bid_categoria\\b/i",
            'categoria_gasto_id',
            $sql,
        ) ?? $sql;

        return $sql;
    }

    private function schemaSummary(): string
    {
        return implode('; ', [
            'gastos(id, usuario_id, nome, valor, data, descricao, categoria_gasto_id, metodo_pagamento, tipo, necessidade, origem_id, deletado_em, created_at, updated_at)',
            'categorias_gastos(id, usuario_id, nome, created_at, updated_at)',
            'gastos_parcelamentos(id, usuario_id, categoria_gasto_id, nome, descricao, valor_total, parcelas_total, data_inicio, ativo, metodo_pagamento, tipo, necessidade, created_at, updated_at)',
            'gastos_parcelas(id, parcelamento_id, usuario_id, numero_parcela, valor, vencimento, gasto_id, status, created_at, updated_at)',
            'gastos_recorrentes(id, usuario_id, categoria_gasto_id, nome, descricao, valor, dia_do_mes, ativo, proxima_data, metodo_pagamento, tipo, necessidade, created_at, updated_at)',
            'orcamentos_categorias(id, usuario_id, categoria_gasto_id, mes, limite, alerta_80_enviado, alerta_100_enviado, created_at, updated_at)',
            'receitas(id, usuario_id, nome, valor, data, descricao, conta_id, created_at, updated_at)',
            'contas(id, usuario_id, nome, tipo, saldo_inicial, created_at, updated_at)',
            'transacoes(id, usuario_id, tipo, valor, data, referencia_tipo, referencia_id, conta_origem_id, conta_destino_id, created_at, updated_at)',
            'carteira_investimentos(id, nome, saldo, usuario_id, created_at, updated_at)',
            'ativos(id, usuario_id, nome, tipo, ticker, created_at, updated_at)',
            'movimentacoes_investimentos(id, usuario_id, carteira_investimentos_id, ativo_id, tipo, valor, quantidade, data, observacao, created_at, updated_at)',
            'users(id, name, email, email_verified_at, password, remember_token, created_at, updated_at)',
            'chats(id, usuario_id, titulo, contexto, created_at, updated_at)',
            'chat_mensagens(id, chat_id, role, conteudo, meta, created_at, updated_at)',
        ]);
    }
}
