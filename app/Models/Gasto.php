<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Gasto extends Model
{
    use HasFactory;

    protected $table = 'gastos';

    protected $fillable = [
        'usuario_id',
        'familia_id',
        'nome',
        'valor',
        'data',
        'descricao',
        'metodo_pagamento',
        'tipo',
        'necessidade',
        'categoria_gasto_id',
        'origem_id',
        'origem_tipo',
        'deletado_em',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data' => 'date:Y-m-d',
        'deletado_em' => 'datetime',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaGasto::class, 'categoria_gasto_id');
    }
}
