<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GastoParcelamento extends Model
{
    use HasFactory;

    protected $table = 'gastos_parcelamentos';

    protected $fillable = [
        'usuario_id',
        'familia_id',
        'categoria_gasto_id',
        'nome',
        'descricao',
        'valor_total',
        'parcelas_total',
        'data_inicio',
        'ativo',
        'metodo_pagamento',
        'tipo',
        'necessidade',
    ];

    protected $casts = [
        'valor_total' => 'decimal:2',
        'parcelas_total' => 'integer',
        'data_inicio' => 'date:Y-m-d',
        'ativo' => 'boolean',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaGasto::class, 'categoria_gasto_id');
    }

    public function parcelas(): HasMany
    {
        return $this->hasMany(GastoParcela::class, 'parcelamento_id');
    }
}
