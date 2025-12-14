<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gastos', function (Blueprint $table) {
            $table->enum('metodo_pagamento', ['DEBITO', 'CREDITO', 'PIX', 'DINHEIRO'])->nullable()->after('descricao');
            $table->enum('tipo', ['FIXO', 'VARIAVEL'])->nullable()->after('metodo_pagamento');
            $table->enum('necessidade', ['ESSENCIAL', 'SUPERFLUO'])->nullable()->after('tipo');

            $table->unsignedBigInteger('origem_id')->nullable()->after('categoria_gasto_id');
            $table->timestamp('deletado_em')->nullable()->after('updated_at');

            $table->index(['usuario_id', 'data'], 'idx_gastos_usuario_data');
            $table->index(['usuario_id', 'categoria_gasto_id', 'data'], 'idx_gastos_usuario_categoria_data');
            $table->index(['usuario_id', 'origem_id'], 'idx_gastos_usuario_origem');
            $table->index(['usuario_id', 'deletado_em'], 'idx_gastos_usuario_deletado_em');
        });
    }

    public function down(): void
    {
        Schema::table('gastos', function (Blueprint $table) {
            $table->dropIndex('idx_gastos_usuario_data');
            $table->dropIndex('idx_gastos_usuario_categoria_data');
            $table->dropIndex('idx_gastos_usuario_origem');
            $table->dropIndex('idx_gastos_usuario_deletado_em');

            $table->dropColumn([
                'metodo_pagamento',
                'tipo',
                'necessidade',
                'origem_id',
                'deletado_em',
            ]);
        });
    }
};

