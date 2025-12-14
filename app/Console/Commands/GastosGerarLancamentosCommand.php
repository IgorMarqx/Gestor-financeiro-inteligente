<?php

namespace App\Console\Commands;

use App\Models\GastoParcela;
use App\Models\GastoRecorrente;
use App\Services\GastosParcelamentosService;
use App\Services\GastosRecorrentesService;
use Illuminate\Console\Command;

class GastosGerarLancamentosCommand extends Command
{
    protected $signature = 'gastos:gerar-lancamentos {--today=}';

    protected $description = 'Gera lançamentos de gastos recorrentes e parcelas vencidas para todos os usuários.';

    public function __construct(
        private readonly GastosRecorrentesService $recorrentes,
        private readonly GastosParcelamentosService $parcelamentos,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $today = $this->option('today');
        $today = is_string($today) && $today !== '' ? $today : null;

        $userIds = collect()
            ->merge(GastoRecorrente::query()->distinct()->pluck('usuario_id'))
            ->merge(GastoParcela::query()->distinct()->pluck('usuario_id'))
            ->unique()
            ->values();

        $totalRec = 0;
        $totalParc = 0;

        foreach ($userIds as $userId) {
            $rec = $this->recorrentes->gerarLancamentos((int) $userId, $today);
            $parc = $this->parcelamentos->gerarLancamentos((int) $userId, $today);

            $totalRec += (int) ($rec['gerados'] ?? 0);
            $totalParc += (int) ($parc['gerados'] ?? 0);
        }

        $this->info("Recorrências geradas: {$totalRec}");
        $this->info("Parcelas geradas: {$totalParc}");

        return self::SUCCESS;
    }
}

