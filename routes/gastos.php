<?php

use App\Http\Controllers\Api\GastosController;
use Illuminate\Support\Facades\Route;

Route::prefix('gastos')->group(function () {
    Route::get('/', [GastosController::class, 'index'])->name('api.gastos.index');
    Route::post('/', [GastosController::class, 'store'])->name('api.gastos.store');
    Route::post('/validar', [GastosController::class, 'validar'])->name('api.gastos.validar');
    Route::put('/{gasto}', [GastosController::class, 'update'])->name('api.gastos.update');
    Route::delete('/{gasto}', [GastosController::class, 'destroy'])->name('api.gastos.destroy');
});
