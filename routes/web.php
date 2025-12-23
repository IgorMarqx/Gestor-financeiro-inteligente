<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Web\WebController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [WebController::class, 'dashboard'])->name('dashboard');
    Route::get('gastos', [WebController::class, 'gastosIndex'])->name('gastos.index');
    Route::get('categorias', [WebController::class, 'categoriasIndex'])->name('categorias.index');
    Route::get('chat', [WebController::class, 'chatIndex'])->name('chat.index');
});

require __DIR__ . '/settings.php';
