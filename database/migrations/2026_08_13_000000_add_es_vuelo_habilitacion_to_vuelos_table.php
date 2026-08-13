<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vuelos', function (Blueprint $table) {
            // El segundo instructor de un vuelo (columna instructor_en_habilitacion_id)
            // puede ser un instructor en habilitación (lo evalúa el instructor_id) o un
            // co-instructor par (ej. ADEX), que vuelan juntos sin que uno capacite al otro.
            // Este flag distingue los dos casos.
            $table->boolean('es_vuelo_habilitacion')->default(false)->after('instructor_en_habilitacion_id');
        });

        // Backfill: hasta ahora el segundo instructor SIEMPRE era una habilitación, así
        // que los vuelos existentes con segundo instructor cargado quedan marcados como tal.
        DB::table('vuelos')
            ->whereNotNull('instructor_en_habilitacion_id')
            ->update(['es_vuelo_habilitacion' => true]);
    }

    public function down(): void
    {
        Schema::table('vuelos', function (Blueprint $table) {
            $table->dropColumn('es_vuelo_habilitacion');
        });
    }
};
