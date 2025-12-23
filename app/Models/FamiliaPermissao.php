<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FamiliaPermissao extends Model
{
    protected $table = 'familia_permissoes';

    protected $fillable = [
        'familia_id',
        'user_id',
        'permissoes',
    ];

    protected $casts = [
        'permissoes' => 'array',
    ];

    public function familia(): BelongsTo
    {
        return $this->belongsTo(Familia::class, 'familia_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
