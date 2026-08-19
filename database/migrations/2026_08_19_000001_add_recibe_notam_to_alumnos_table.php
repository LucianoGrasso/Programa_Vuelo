<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumnos', function (Blueprint $table) {
            // Independiente de tener el email cargado: permite guardarlo para otro
            // uso a futuro sin que eso implique recibir el NOTAM diario (notam:enviar).
            // Default true: si ya tiene email, por defecto lo recibe.
            $table->boolean('recibe_notam')->default(true)->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('alumnos', function (Blueprint $table) {
            $table->dropColumn('recibe_notam');
        });
    }
};
