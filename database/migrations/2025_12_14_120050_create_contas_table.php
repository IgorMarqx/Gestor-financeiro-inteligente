<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            $table->string('nome', 100);
            $table->enum('tipo', ['BANCO', 'CARTEIRA', 'CARTAO']);
            $table->decimal('saldo_inicial', 15, 2)->default(0);
            $table->timestamps();

            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['usuario_id', 'tipo'], 'idx_contas_usuario_tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contas');
    }
};

