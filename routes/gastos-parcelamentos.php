<?php

use App\Http\Controllers\Api\GastosParcelamentosController;
use App\Http\Controllers\Api\GastosParcelasController;
use Illuminate\Support\Facades\Route;

Route::prefix('gastos-parcelamentos')->group(function () {
    Route::get('/', [GastosParcelamentosController::class, 'index'])->name('api.gastos_parcelamentos.index');
    Route::post('/', [GastosParcelamentosController::class, 'store'])->name('api.gastos_parcelamentos.store');
    Route::put('/{id}', [GastosParcelamentosController::class, 'update'])->name('api.gastos_parcelamentos.update');
    Route::delete('/{id}', [GastosParcelamentosController::class, 'destroy'])->name('api.gastos_parcelamentos.destroy');
    Route::post('/{id}/pausar', [GastosParcelamentosController::class, 'pausar'])->name('api.gastos_parcelamentos.pausar');
    Route::post('/{id}/ativar', [GastosParcelamentosController::class, 'ativar'])->name('api.gastos_parcelamentos.ativar');
    Route::post('/{id}/gerar-parcelas', [GastosParcelamentosController::class, 'gerarParcelas'])->name('api.gastos_parcelamentos.gerar_parcelas');
});

Route::prefix('gastos-parcelas')->group(function () {
    Route::get('/', [GastosParcelasController::class, 'index'])->name('api.gastos_parcelas.index');
    Route::post('/gerar-lancamentos', [GastosParcelasController::class, 'gerarLancamentos'])->name('api.gastos_parcelas.gerar_lancamentos');
});
