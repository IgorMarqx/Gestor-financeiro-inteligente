<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimentacoes_investimentos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('carteira_investimentos_id');
            $table->unsignedBigInteger('ativo_id');
            $table->enum('tipo', ['APORTE', 'COMPRA', 'VENDA', 'RENDIMENTO']);
            $table->decimal('valor', 15, 2);
            $table->decimal('quantidade', 18, 8)->nullable();
            $table->date('data');
            $table->tinyText('observacao')->nullable();
            $table->timestamps();

            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('carteira_investimentos_id')->references('id')->on('carteira_investimentos')->onDelete('cascade');
            $table->foreign('ativo_id')->references('id')->on('ativos')->onDelete('cascade');

            $table->index(['usuario_id', 'data'], 'idx_mov_inv_usuario_data');
            $table->index(['usuario_id', 'carteira_investimentos_id', 'data'], 'idx_mov_inv_usuario_carteira_data');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimentacoes_investimentos');
    }
};

