<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    Route::middleware(['api', StartSession::class])->post('/auth/login', [AuthController::class, 'login'])
        ->name('api.auth.login');

    Route::middleware(['api', StartSession::class, 'jwt.auth'])->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me'])->name('api.auth.me');
        Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
    });
});
