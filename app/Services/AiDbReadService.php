<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class AiDbReadService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function select(string $sql, array $bindings = []): array
    {
        $sql = trim($sql);
        $this->assertReadOnlySql($sql);
        $this->assertAllowedTables($sql);

        $maxRows = (int) (config('ai_db.max_rows', 50));
        if ($maxRows <= 0 || $maxRows > 200) $maxRows = 50;

        $sql = $this->applyLimitIfMissing($sql, $maxRows);

        /** @var array<int, object> $rows */
        $rows = DB::select($sql, $bindings);

        return array_map(fn ($row) => (array) $row, $rows);
    }

    private function assertReadOnlySql(string $sql): void
    {
        $normalized = strtolower(preg_replace('/\\s+/', ' ', $sql) ?? $sql);

        if (! str_starts_with($normalized, 'select ') && ! str_starts_with($normalized, 'with ')) {
            throw new \RuntimeException('Apenas consultas SELECT são permitidas.');
        }

        $forbidden = [
            'insert ',
            'update ',
            'delete ',
            'drop ',
            'alter ',
            'create ',
            'truncate ',
            'replace ',
            'merge ',
            'grant ',
            'revoke ',
            'call ',
        ];

        foreach ($forbidden as $word) {
            if (str_contains($normalized, $word)) {
                throw new \RuntimeException('Consulta bloqueada: operação não permitida.');
            }
        }

        // Prevent stacked queries.
        if (preg_match('/;\\s*\\S/', $sql) === 1) {
            throw new \RuntimeException('Consulta bloqueada: múltiplas instruções não são permitidas.');
        }
    }

    private function assertAllowedTables(string $sql): void
    {
        $allowed = config('ai_db.allowed_tables', []);
        if (! is_array($allowed) || $allowed === []) {
            throw new \RuntimeException('AI_DB_ALLOWED_TABLES não configurado.');
        }

        $mentioned = $this->extractTables($sql);
        foreach ($mentioned as $table) {
            if (! in_array($table, $allowed, true)) {
                throw new \RuntimeException("Tabela não permitida: {$table}");
            }
        }
    }

    /**
     * @return array<int, string>
     */
    private function extractTables(string $sql): array
    {
        $sql = preg_replace('/\\s+/', ' ', $sql) ?? $sql;
        $sql = preg_replace('/`/', '', $sql) ?? $sql;

        $tables = [];
        if (preg_match_all('/\\b(from|join)\\s+([a-zA-Z0-9_\\.]+)/i', $sql, $matches) === 1) {
            foreach ($matches[2] as $t) {
                $t = strtolower($t);
                if (str_contains($t, '.')) {
                    $t = explode('.', $t)[1] ?? $t;
                }
                $tables[] = $t;
            }
        }

        return array_values(array_unique($tables));
    }

    private function applyLimitIfMissing(string $sql, int $limit): string
    {
        $normalized = strtolower($sql);
        if (preg_match('/\\blimit\\s+\\d+\\b/', $normalized) === 1) return $sql;
        return rtrim($sql, ';')." LIMIT {$limit}";
    }
}

