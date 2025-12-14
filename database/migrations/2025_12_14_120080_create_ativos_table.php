<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ativos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            $table->string('nome', 120);
            $table->enum('tipo', ['ACAO', 'FII', 'RF', 'CRIPTO']);
            $table->string('ticker', 20)->nullable();
            $table->timestamps();

            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['usuario_id', 'tipo'], 'idx_ativos_usuario_tipo');
            $table->index(['usuario_id', 'ticker'], 'idx_ativos_usuario_ticker');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ativos');
    }
};

