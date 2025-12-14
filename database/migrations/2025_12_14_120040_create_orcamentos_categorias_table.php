<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orcamentos_categorias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('categoria_gasto_id');
            $table->char('mes', 7);
            $table->decimal('limite', 15, 2);
            $table->tinyInteger('alerta_80_enviado')->default(0);
            $table->tinyInteger('alerta_100_enviado')->default(0);
            $table->timestamps();

            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('categoria_gasto_id')->references('id')->on('categorias_gastos')->onDelete('cascade');

            $table->unique(['usuario_id', 'categoria_gasto_id', 'mes'], 'uq_orcamentos_usuario_categoria_mes');
            $table->index(['usuario_id', 'mes'], 'idx_orcamentos_usuario_mes');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orcamentos_categorias');
    }
};

