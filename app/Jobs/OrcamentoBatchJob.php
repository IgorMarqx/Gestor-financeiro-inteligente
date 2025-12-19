<?php

namespace App\Jobs;

use App\Models\OrcamentoCategoria;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrcamentoBatchJob implements ShouldQueue
{
    use Batchable, Queueable;

    protected array $rows;

    /**
     * Create a new job instance.
     */
    public function __construct(array $rows)
    {
        $this->rows = $rows;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $rows = $this->rows;

        DB::transaction(function () use ($rows) {
            OrcamentoCategoria::query()->upsert(
                $rows,
                ['usuario_id', 'categoria_gasto_id', 'mes'],
                ['limite', 'alerta_80_enviado', 'alerta_100_enviado', 'updated_at'],
            );
        });
    }

    public function catch(\Throwable $exception): void
    {
        Log::error('OrcamentoBatchJob falhou', [
            'message' => $exception->getMessage(),
            'exception' => $exception,
            'rows_count' => count($this->rows ?? []),
        ]);
    }
}
