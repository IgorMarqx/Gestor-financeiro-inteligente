<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transacoes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            $table->enum('tipo', ['RECEITA', 'GASTO', 'TRANSFERENCIA']);
            $table->decimal('valor', 15, 2);
            $table->date('data');
            $table->string('referencia_tipo', 50)->nullable();
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->unsignedBigInteger('conta_origem_id')->nullable();
            $table->unsignedBigInteger('conta_destino_id')->nullable();
            $table->timestamps();

            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('conta_origem_id')->references('id')->on('contas')->nullOnDelete();
            $table->foreign('conta_destino_id')->references('id')->on('contas')->nullOnDelete();

            $table->index(['usuario_id', 'data'], 'idx_transacoes_usuario_data');
            $table->index(['usuario_id', 'tipo', 'data'], 'idx_transacoes_usuario_tipo_data');
            $table->index(['usuario_id', 'referencia_tipo', 'referencia_id'], 'idx_transacoes_usuario_ref');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transacoes');
    }
};

