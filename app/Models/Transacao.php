<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transacao extends Model
{
    use HasFactory;

    protected $table = 'transacoes';

    protected $fillable = [
        'usuario_id',
        'tipo',
        'valor',
        'data',
        'referencia_tipo',
        'referencia_id',
        'conta_origem_id',
        'conta_destino_id',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data' => 'date:Y-m-d',
    ];

    public function contaOrigem(): BelongsTo
    {
        return $this->belongsTo(Conta::class, 'conta_origem_id');
    }

    public function contaDestino(): BelongsTo
    {
        return $this->belongsTo(Conta::class, 'conta_destino_id');
    }
}

