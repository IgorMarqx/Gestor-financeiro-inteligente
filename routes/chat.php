<?php

use App\Http\Controllers\Api\ChatController;
use Illuminate\Support\Facades\Route;

Route::prefix('chat')->group(function () {
    Route::get('getChats', [ChatController::class, 'getChats'])->name('api.chat.getChats');
    Route::get('getConversation', [ChatController::class, 'getConversation'])->name('api.chat.getConversation');

    Route::post('createChat', [ChatController::class, 'createChat'])->name('api.chat.createChat');
    Route::post('conversation', [ChatController::class, 'conversation'])->name('api.chat.conversation');

    Route::put('updateChat', [ChatController::class, 'updateChat'])->name('api.chat.updateChat');

    Route::delete('deleteChat', [ChatController::class, 'deleteChat'])->name('api.chat.deleteChat');
});
