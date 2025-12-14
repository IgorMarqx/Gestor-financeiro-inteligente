<?php

use App\Http\Controllers\Api\CategoriasGastosController;
use Illuminate\Support\Facades\Route;

Route::prefix('categorias-gastos')->group(function () {
    Route::get('/', [CategoriasGastosController::class, 'index'])->name('api.categorias_gastos.index');
    Route::post('/', [CategoriasGastosController::class, 'store'])->name('api.categorias_gastos.store');
});

