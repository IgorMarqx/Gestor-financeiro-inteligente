<?php

use App\Http\Controllers\Api\GastosRecorrentesController;
use Illuminate\Support\Facades\Route;

Route::prefix('gastos-recorrentes')->group(function () {
    Route::get('/', [GastosRecorrentesController::class, 'index'])->name('api.gastos_recorrentes.index');
    Route::post('/', [GastosRecorrentesController::class, 'store'])->name('api.gastos_recorrentes.store');
    Route::put('/{id}', [GastosRecorrentesController::class, 'update'])->name('api.gastos_recorrentes.update');
    Route::delete('/{id}', [GastosRecorrentesController::class, 'destroy'])->name('api.gastos_recorrentes.destroy');
    Route::post('/{id}/pausar', [GastosRecorrentesController::class, 'pausar'])->name('api.gastos_recorrentes.pausar');
    Route::post('/{id}/ativar', [GastosRecorrentesController::class, 'ativar'])->name('api.gastos_recorrentes.ativar');
    Route::post('/gerar-lancamentos', [GastosRecorrentesController::class, 'gerarLancamentos'])->name('api.gastos_recorrentes.gerar_lancamentos');
});

