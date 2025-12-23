<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Familia extends Model
{
    protected $table = 'familias';

    protected $fillable = [
        'nome',
        'criado_por_user_id',
    ];

    public function criador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por_user_id');
    }

    public function membros(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'familia_user')
            ->withPivot('vinculo')
            ->withTimestamps()
            ->wherePivot('vinculo', true);
    }

    public function membrosTodos(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'familia_user')
            ->withPivot('vinculo')
            ->withTimestamps();
    }

    public function permissoes(): HasMany
    {
        return $this->hasMany(FamiliaPermissao::class, 'familia_id');
    }
}
