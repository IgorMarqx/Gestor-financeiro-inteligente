<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('familias', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 120);
            $table->unsignedBigInteger('criado_por_user_id')->nullable();
            $table->timestamps();

            $table->foreign('criado_por_user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('familia_permissoes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('familia_id');
            $table->unsignedBigInteger('user_id');
            $table->json('permissoes')->nullable();
            $table->timestamps();

            $table->foreign('familia_id')->references('id')->on('familias')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['familia_id', 'user_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('familia_id')->nullable()->after('id');
            $table->index('familia_id');
            $table->foreign('familia_id')->references('id')->on('familias')->nullOnDelete();
        });

        $tables = [
            'categorias_gastos',
            'gastos',
            'gastos_recorrentes',
            'gastos_parcelamentos',
            'gastos_parcelas',
            'orcamentos_categorias',
            'contas',
            'receitas',
            'transacoes',
            'ativos',
            'carteira_investimentos',
            'movimentacoes_investimentos',
            'chats',
            'chat_mensagens',
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->unsignedBigInteger('familia_id')->nullable()->after('id');
                $table->index('familia_id');
            });
        }
    }

    public function down(): void
    {
        $tables = [
            'categorias_gastos',
            'gastos',
            'gastos_recorrentes',
            'gastos_parcelamentos',
            'gastos_parcelas',
            'orcamentos_categorias',
            'contas',
            'receitas',
            'transacoes',
            'ativos',
            'carteira_investimentos',
            'movimentacoes_investimentos',
            'chats',
            'chat_mensagens',
        ];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropIndex(['familia_id']);
                $table->dropColumn('familia_id');
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['familia_id']);
            $table->dropIndex(['familia_id']);
            $table->dropColumn('familia_id');
        });

        Schema::dropIfExists('familia_permissoes');
        Schema::dropIfExists('familias');
    }
};
