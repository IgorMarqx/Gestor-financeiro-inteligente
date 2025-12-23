<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrcamentoCategoria extends Model
{
    use HasFactory;

    protected $table = 'orcamentos_categorias';

    protected $fillable = [
        'usuario_id',
        'familia_id',
        'categoria_gasto_id',
        'mes',
        'limite',
        'alerta_80_enviado',
        'alerta_100_enviado',
    ];

    protected $casts = [
        'limite' => 'decimal:2',
        'alerta_80_enviado' => 'boolean',
        'alerta_100_enviado' => 'boolean',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaGasto::class, 'categoria_gasto_id');
    }
}
