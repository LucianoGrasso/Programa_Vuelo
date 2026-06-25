<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vuelos', function (Blueprint $table) {
            // Eliminamos el campo viejo
            $table->dropColumn('dotacion');
            
            // Añadimos los dos campos nuevos separados
            $table->string('instructor')->after('mision');
            $table->string('alumno')->after('instructor');
        });
    }

    public function down(): void
    {
        Schema::table('vuelos', function (Blueprint $table) {
            $table->dropColumn(['instructor', 'alumno']);
            $table->string('dotacion')->after('mision');
        });
    }
};