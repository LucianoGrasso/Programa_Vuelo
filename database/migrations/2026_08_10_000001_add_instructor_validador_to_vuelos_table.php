<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vuelos', function (Blueprint $table) {
            // Vuelo de habilitación: un instructor vuela siendo evaluado por otro
            // instructor más senior (sin alumno a bordo). instructor_id sigue
            // siendo el que vuela/enseña; este es el que lo está validando.
            $table->foreignId('instructor_validador_id')->nullable()->after('instructor_id')->constrained('instructores');
        });
    }

    public function down(): void
    {
        Schema::table('vuelos', function (Blueprint $table) {
            $table->dropForeign(['instructor_validador_id']);
            $table->dropColumn('instructor_validador_id');
        });
    }
};
