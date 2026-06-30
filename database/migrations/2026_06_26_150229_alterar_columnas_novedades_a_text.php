<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('novedades_diarias', function (Blueprint $table) {
            // Cambiamos de string a text para que soporte JSON largos
            $table->text('obs_instructores')->nullable()->change();
            $table->text('obs_alumnos')->nullable()->change();
            $table->text('aeronaves')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('novedades_diarias', function (Blueprint $table) {
            $table->string('obs_instructores', 255)->nullable()->change();
            $table->string('obs_alumnos', 255)->nullable()->change();
            $table->string('aeronaves', 255)->nullable()->change();
        });
    }
};