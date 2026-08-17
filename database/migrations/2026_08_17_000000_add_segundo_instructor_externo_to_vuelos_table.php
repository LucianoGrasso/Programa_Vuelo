<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vuelos', function (Blueprint $table) {
            // Nombre libre para un segundo instructor que voló la misión pero es
            // externo a la escuela (no tiene ficha en `instructores`), ej. un
            // instructor de otra unidad/institución. Mutuamente excluyente con
            // instructor_en_habilitacion_id: o es de la ficha, o es este texto.
            $table->string('segundo_instructor_externo')->nullable()->after('es_vuelo_habilitacion');
        });
    }

    public function down(): void
    {
        Schema::table('vuelos', function (Blueprint $table) {
            $table->dropColumn('segundo_instructor_externo');
        });
    }
};
