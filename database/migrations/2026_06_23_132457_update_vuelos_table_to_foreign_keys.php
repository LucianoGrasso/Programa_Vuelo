<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vuelos', function (Blueprint $table) {
            // Eliminamos las columnas de texto antiguo
            $table->dropColumn(['instructor', 'alumno']);

            // Creamos las columnas relacionales amarradas a las tablas correspondientes
            $table->foreignId('instructor_id')->after('mision')->constrained('instructores');
            $table->foreignId('alumno_id')->after('instructor_id')->constrained('alumnos');
        });
    }

    public function down(): void
    {
        Schema::table('vuelos', function (Blueprint $table) {
            $table->dropForeign(['instructor_id']);
            $table->dropForeign(['alumno_id']);
            $table->dropColumn(['instructor_id', 'alumno_id']);
            
            $table->string('instructor')->after('mision');
            $table->string('alumno')->after('instructor');
        });
    }
};