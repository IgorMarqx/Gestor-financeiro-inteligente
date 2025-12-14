<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gastos_recorrentes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('categoria_gasto_id');

            $table->string('nome', 100);
            $table->tinyText('descricao')->nullable();
            $table->decimal('valor', 15, 2);
            $table->unsignedTinyInteger('dia_do_mes');
            $table->tinyInteger('ativo')->default(1);
            $table->date('proxima_data');
            $table->enum('metodo_pagamento', ['DEBITO', 'CREDITO', 'PIX', 'DINHEIRO'])->nullable();
            $table->enum('tipo', ['FIXO', 'VARIAVEL'])->nullable();
            $table->enum('necessidade', ['ESSENCIAL', 'SUPERFLUO'])->nullable();

            $table->timestamps();

            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('categoria_gasto_id')->references('id')->on('categorias_gastos')->onDelete('cascade');

            $table->index(['usuario_id', 'ativo', 'proxima_data'], 'idx_gastos_recorrentes_usuario_ativo_proxima');
            $table->index(['usuario_id', 'categoria_gasto_id'], 'idx_gastos_recorrentes_usuario_categoria');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gastos_recorrentes');
    }
};

