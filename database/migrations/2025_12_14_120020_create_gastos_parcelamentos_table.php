<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gastos_parcelamentos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('categoria_gasto_id');

            $table->string('nome', 100);
            $table->tinyText('descricao')->nullable();
            $table->decimal('valor_total', 15, 2);
            $table->unsignedInteger('parcelas_total');
            $table->date('data_inicio');
            $table->tinyInteger('ativo')->default(1);

            $table->enum('metodo_pagamento', ['DEBITO', 'CREDITO', 'PIX', 'DINHEIRO'])->nullable();
            $table->enum('tipo', ['FIXO', 'VARIAVEL'])->nullable();
            $table->enum('necessidade', ['ESSENCIAL', 'SUPERFLUO'])->nullable();

            $table->timestamps();

            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('categoria_gasto_id')->references('id')->on('categorias_gastos')->onDelete('cascade');

            $table->index(['usuario_id', 'ativo', 'data_inicio'], 'idx_gastos_parcelamentos_usuario_ativo_inicio');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gastos_parcelamentos');
    }
};

