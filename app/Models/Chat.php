<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chat extends Model
{
    protected $table = 'chats';

    protected $fillable = [
        'usuario_id',
        'titulo',
        'contexto',
    ];

    protected $casts = [
        'contexto' => 'array',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function mensagens(): HasMany
    {
        return $this->hasMany(ChatMensagem::class, 'chat_id');
    }
}

