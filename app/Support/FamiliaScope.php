<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;

class FamiliaScope
{
    public static function resolveFamiliaId(int $userId, ?int $familiaId = null): ?int
    {
        if ($familiaId !== null) {
            return $familiaId;
        }

        return DB::table('familia_user')
            ->where('user_id', $userId)
            ->where('vinculo', true)
            ->value('familia_id');
    }

    /**
     * @param  EloquentBuilder|QueryBuilder  $query
     * @return EloquentBuilder|QueryBuilder
     */
    public static function apply(object $query, int $userId, ?int $familiaId, string $tablePrefix = ''): object
    {
        $familiaColumn = $tablePrefix !== '' ? "{$tablePrefix}.familia_id" : 'familia_id';
        $userColumn = $tablePrefix !== '' ? "{$tablePrefix}.usuario_id" : 'usuario_id';

        if ($familiaId !== null) {
            return $query->where($familiaColumn, $familiaId);
        }

        return $query->where($userColumn, $userId);
    }
}
