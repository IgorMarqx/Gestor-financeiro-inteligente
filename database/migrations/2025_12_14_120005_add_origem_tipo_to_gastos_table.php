<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gastos', function (Blueprint $table) {
            $table->enum('origem_tipo', ['RECORRENTE', 'PARCELA'])->nullable()->after('origem_id');
            $table->index(['usuario_id', 'origem_tipo', 'data'], 'idx_gastos_usuario_origem_tipo_data');
        });
    }

    public function down(): void
    {
        Schema::table('gastos', function (Blueprint $table) {
            $table->dropIndex('idx_gastos_usuario_origem_tipo_data');
            $table->dropColumn('origem_tipo');
        });
    }
};

