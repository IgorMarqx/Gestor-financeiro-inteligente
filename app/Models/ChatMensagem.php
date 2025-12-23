<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMensagem extends Model
{
    protected $table = 'chat_mensagens';

    protected $fillable = [
        'chat_id',
        'familia_id',
        'role',
        'conteudo',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class, 'chat_id');
    }
}
