<?php

use App\Http\Controllers\Api\ChatController;
use Illuminate\Support\Facades\Route;

Route::prefix('chat')->group(function () {
    Route::get('/getChats', [ChatController::class, 'getChats'])->name('api.chat.list');
    Route::post('/createChat', [ChatController::class, 'createChat'])->name('api.chat.create');
    Route::get('/getConversation', [ChatController::class, 'getConversation'])->name('api.chat.conversation');
    Route::post('/conversation', [ChatController::class, 'conversation'])->name('api.chat.send');
    Route::put('/updateChat', [ChatController::class, 'updateChat'])->name('api.chat.update');
});
