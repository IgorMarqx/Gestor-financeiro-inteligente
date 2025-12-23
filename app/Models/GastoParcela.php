<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GastoParcela extends Model
{
    use HasFactory;

    protected $table = 'gastos_parcelas';

    protected $fillable = [
        'parcelamento_id',
        'usuario_id',
        'familia_id',
        'numero_parcela',
        'valor',
        'vencimento',
        'gasto_id',
        'status',
    ];

    protected $casts = [
        'numero_parcela' => 'integer',
        'valor' => 'decimal:2',
        'vencimento' => 'date:Y-m-d',
    ];

    public function parcelamento(): BelongsTo
    {
        return $this->belongsTo(GastoParcelamento::class, 'parcelamento_id');
    }

    public function gasto(): BelongsTo
    {
        return $this->belongsTo(Gasto::class, 'gasto_id');
    }
}
