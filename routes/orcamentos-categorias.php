<?php

use App\Http\Controllers\Api\OrcamentosCategoriasController;
use Illuminate\Support\Facades\Route;

Route::prefix('orcamentos-categorias')->group(function () {
    Route::get('/', [OrcamentosCategoriasController::class, 'index'])->name('api.orcamentos_categorias.index');
    Route::post('/', [OrcamentosCategoriasController::class, 'store'])->name('api.orcamentos_categorias.store');
    Route::post('/upsert', [OrcamentosCategoriasController::class, 'upsert'])->name('api.orcamentos_categorias.upsert');
    Route::post('/batch-upsert', [OrcamentosCategoriasController::class, 'batchUpsert'])->name('api.orcamentos_categorias.batch_upsert');
    Route::put('/{id}', [OrcamentosCategoriasController::class, 'update'])->name('api.orcamentos_categorias.update');
    Route::delete('/{id}', [OrcamentosCategoriasController::class, 'destroy'])->name('api.orcamentos_categorias.destroy');
    Route::delete('/', [OrcamentosCategoriasController::class, 'destroyByCategoriaMes'])->name('api.orcamentos_categorias.destroy_by_categoria_mes');
    Route::get('/resumo', [OrcamentosCategoriasController::class, 'resumo'])->name('api.orcamentos_categorias.resumo');
});
