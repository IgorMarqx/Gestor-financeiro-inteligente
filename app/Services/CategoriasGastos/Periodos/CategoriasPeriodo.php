<?php

namespace App\Services\CategoriasGastos\Periodos;

class CategoriasPeriodo
{
    public function __construct(
        public readonly string $inicio,
        public readonly string $fim,
        public readonly ?string $mes,
    ) {}
}

