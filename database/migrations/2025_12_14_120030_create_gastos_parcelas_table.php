<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gastos_parcelas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parcelamento_id');
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedInteger('numero_parcela');
            $table->decimal('valor', 15, 2);
            $table->date('vencimento');
            $table->unsignedBigInteger('gasto_id')->nullable();
            $table->enum('status', ['PENDENTE', 'GERADO', 'PAGO'])->default('PENDENTE');
            $table->timestamps();

            $table->foreign('parcelamento_id')->references('id')->on('gastos_parcelamentos')->onDelete('cascade');
            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('gasto_id')->references('id')->on('gastos')->nullOnDelete();

            $table->unique(['parcelamento_id', 'numero_parcela'], 'uq_gastos_parcelas_parcelamento_numero');
            $table->index(['usuario_id', 'status', 'vencimento'], 'idx_gastos_parcelas_usuario_status_vencimento');
            $table->index(['usuario_id', 'gasto_id'], 'idx_gastos_parcelas_usuario_gasto');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gastos_parcelas');
    }
};

