<?php

use App\Http\Controllers\Api\FamiliaController;
use Illuminate\Support\Facades\Route;

Route::prefix('familia')->group(function () {
    Route::get('/', [FamiliaController::class, 'show'])->name('api.familia.show');
    Route::post('/', [FamiliaController::class, 'store'])->name('api.familia.store');
    Route::put('/', [FamiliaController::class, 'update'])->name('api.familia.update');
    Route::delete('/', [FamiliaController::class, 'destroy'])->name('api.familia.destroy');

    Route::post('/membros', [FamiliaController::class, 'addMember'])->name('api.familia.membros.store');
    Route::delete('/membros/{userId}', [FamiliaController::class, 'removeMember'])->name('api.familia.membros.destroy');
});
