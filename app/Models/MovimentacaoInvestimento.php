<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimentacaoInvestimento extends Model
{
    use HasFactory;

    protected $table = 'movimentacoes_investimentos';

    protected $fillable = [
        'usuario_id',
        'carteira_investimentos_id',
        'ativo_id',
        'tipo',
        'valor',
        'quantidade',
        'data',
        'observacao',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'quantidade' => 'decimal:8',
        'data' => 'date:Y-m-d',
    ];

    public function ativo(): BelongsTo
    {
        return $this->belongsTo(Ativo::class, 'ativo_id');
    }
}

