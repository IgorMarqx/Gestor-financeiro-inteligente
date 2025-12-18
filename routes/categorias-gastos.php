<?php

use App\Http\Controllers\Api\CategoriasGastosController;
use Illuminate\Support\Facades\Route;

Route::prefix('categorias-gastos')->group(function () {
    Route::get('/', [CategoriasGastosController::class, 'index'])->name('api.categorias_gastos.index');
    Route::get('/resumo', [CategoriasGastosController::class, 'resumo'])->name('api.categorias_gastos.resumo');
    Route::get('/{id}/gastos', [CategoriasGastosController::class, 'gastos'])->name('api.categorias_gastos.gastos');
    Route::post('/', [CategoriasGastosController::class, 'store'])->name('api.categorias_gastos.store');
    Route::put('/{id}', [CategoriasGastosController::class, 'update'])->name('api.categorias_gastos.update');
    Route::delete('/{id}', [CategoriasGastosController::class, 'destroy'])->name('api.categorias_gastos.destroy');
});
