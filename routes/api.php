<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Config\ReverbConfigController;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', EncryptCookies::class, AddQueuedCookiesToResponse::class, StartSession::class])
    ->post('/auth/login', [AuthController::class, 'login'])
    ->name('api.auth.login');

Route::middleware(['api', EncryptCookies::class, AddQueuedCookiesToResponse::class, StartSession::class])
    ->post('/auth/logout', [AuthController::class, 'logout'])
    ->name('api.auth.logout');

Broadcast::routes();

Route::middleware([
    'api',
    EncryptCookies::class,
    AddQueuedCookiesToResponse::class,
    StartSession::class,
    'jwt.auth',
])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me'])->name('api.auth.me');
    Route::get('/reverb/configs', [ReverbConfigController::class, 'ReverbConfigs'])->name('api.reverb.configs');

    require __DIR__ . '/gastos.php';
    require __DIR__ . '/categorias-gastos.php';
    require __DIR__ . '/gastos-recorrentes.php';
    require __DIR__ . '/gastos-parcelamentos.php';
    require __DIR__ . '/orcamentos-categorias.php';
    require __DIR__ . '/chat.php';
});
