<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receitas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            $table->string('nome', 100);
            $table->decimal('valor', 15, 2);
            $table->date('data');
            $table->tinyText('descricao')->nullable();
            $table->unsignedBigInteger('conta_id')->nullable();
            $table->timestamps();

            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('conta_id')->references('id')->on('contas')->nullOnDelete();
            $table->index(['usuario_id', 'data'], 'idx_receitas_usuario_data');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receitas');
    }
};

