<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Receita extends Model
{
    use HasFactory;

    protected $table = 'receitas';

    protected $fillable = [
        'usuario_id',
        'nome',
        'valor',
        'data',
        'descricao',
        'conta_id',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data' => 'date:Y-m-d',
    ];

    public function conta(): BelongsTo
    {
        return $this->belongsTo(Conta::class, 'conta_id');
    }
}

