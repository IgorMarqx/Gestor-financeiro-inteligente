<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GastoRecorrente extends Model
{
    use HasFactory;

    protected $table = 'gastos_recorrentes';

    protected $fillable = [
        'usuario_id',
        'categoria_gasto_id',
        'nome',
        'descricao',
        'valor',
        'dia_do_mes',
        'ativo',
        'proxima_data',
        'metodo_pagamento',
        'tipo',
        'necessidade',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'dia_do_mes' => 'integer',
        'ativo' => 'boolean',
        'proxima_data' => 'date:Y-m-d',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaGasto::class, 'categoria_gasto_id');
    }
}

