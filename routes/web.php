<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('gastos', function () {
        return Inertia::render('gastos/index');
    })->name('gastos.index');

    Route::get('categorias', function () {
        return Inertia::render('categorias-gastos/index');
    })->name('categorias.index');
});

require __DIR__.'/settings.php';
