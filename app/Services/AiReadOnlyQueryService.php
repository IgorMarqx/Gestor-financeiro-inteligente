<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class AiReadOnlyQueryService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function run(string $sql, int $userId): array
    {
        $sql = $this->normalizeSql($sql);
        $this->assertReadOnly($sql);
        $tables = $this->extractTables($sql);
        $this->assertTablesAllowed($tables);
        $sql = $this->injectUserScope($sql, $tables);

        $maxRows = $this->maxRows();
        $wrappedSql = "select * from ({$sql}) as ai_subquery limit {$maxRows}";

        $rows = DB::select($wrappedSql, ['user_id' => $userId]);

        return array_map(static fn ($row) => (array) $row, $rows);
    }

    private function normalizeSql(string $sql): string
    {
        $sql = trim($sql);
        $sql = preg_replace('/\s+/', ' ', $sql) ?? $sql;
        return rtrim($sql, ';');
    }

    private function assertReadOnly(string $sql): void
    {
        if (! preg_match('/^select\s/i', $sql)) {
            throw new RuntimeException('Apenas consultas SELECT são permitidas.');
        }

        $blocked = '/\b(insert|update|delete|drop|alter|create|truncate|merge|call|exec|grant|revoke)\b/i';
        if (preg_match($blocked, $sql)) {
            throw new RuntimeException('Consulta inválida.');
        }

        if (preg_match('/(--|\/\*)/', $sql)) {
            throw new RuntimeException('Consulta inválida.');
        }
    }

    /**
     * @return array<int, string>
     */
    private function extractTables(string $sql): array
    {
        $tables = [];
        preg_match_all('/\b(from|join)\s+([`"\[]?\w+[`"\]]?)/i', $sql, $matches);
        foreach ($matches[2] ?? [] as $table) {
            $clean = strtolower(trim($table, " \t\n\r\0\x0B`\"[]"));
            if ($clean !== '') {
                $tables[] = $clean;
            }
        }

        return array_values(array_unique($tables));
    }

    /**
     * @param  array<int, string>  $tables
     */
    private function assertTablesAllowed(array $tables): void
    {
        if ($tables === []) {
            throw new RuntimeException('Não foi possível identificar tabelas na consulta.');
        }

        $allowed = $this->allowedTables();
        foreach ($tables as $table) {
            if (! in_array($table, $allowed, true)) {
                throw new RuntimeException('Tabela não permitida na consulta.');
            }
        }
    }

    /**
     * @param  array<int, string>  $tables
     */
    private function injectUserScope(string $sql, array $tables): string
    {
        if (preg_match('/\b:user_id\b/i', $sql)) {
            return $sql;
        }

        $column = in_array('users', $tables, true) ? 'users.id' : 'usuario_id';
        $pattern = '/\b' . preg_quote($column, '/') . '\s*=\s*\d+\b/i';
        if (preg_match($pattern, $sql)) {
            $replaced = preg_replace($pattern, $column . ' = :user_id', $sql);
            return $replaced ?? $sql;
        }

        $hasWhere = (bool) preg_match('/\bwhere\b/i', $sql);
        return $this->appendCondition($sql, $column . ' = :user_id', $hasWhere);
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

    /**
     * @return array<int, string>
     */
    private function allowedTables(): array
    {
        $list = (string) env('AI_DB_ALLOWED_TABLES', '');
        $items = array_filter(array_map('trim', explode(',', $list)));
        return array_map('strtolower', $items);
    }

    private function maxRows(): int
    {
        $max = (int) env('AI_DB_MAX_ROWS', 50);
        return $max > 0 ? $max : 50;
    }
}
