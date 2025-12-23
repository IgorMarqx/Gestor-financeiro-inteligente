<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('familia_user', function (Blueprint $table) {
            $table->unsignedBigInteger('familia_id');
            $table->unsignedBigInteger('user_id');
            $table->boolean('vinculo')->default(true);
            $table->timestamps();

            $table->foreign('familia_id')->references('id')->on('familias')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['familia_id', 'user_id']);
        });

        DB::statement("
            insert into familia_user (familia_id, user_id, vinculo, created_at, updated_at)
            select familia_id, id, 1, now(), now()
            from users
            where familia_id is not null
        ");

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['familia_id']);
            $table->dropIndex(['familia_id']);
            $table->dropColumn('familia_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('familia_id')->nullable()->after('id');
            $table->index('familia_id');
            $table->foreign('familia_id')->references('id')->on('familias')->nullOnDelete();
        });

        DB::statement("
            update users
            set familia_id = (
                select familia_id
                from familia_user
                where familia_user.user_id = users.id
                  and familia_user.vinculo = 1
                limit 1
            )
        ");

        Schema::dropIfExists('familia_user');
    }
};
