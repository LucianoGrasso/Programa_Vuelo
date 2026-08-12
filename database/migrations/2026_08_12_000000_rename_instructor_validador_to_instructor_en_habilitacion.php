<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Corrige el nombre: el campo secundario no es el que valida, es el
     * instructor que está siendo validado/habilitado por el instructor
     * principal (instructor_id). "instructor_validador" tenía el rol invertido.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE vuelos RENAME COLUMN instructor_validador_id TO instructor_en_habilitacion_id');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE vuelos RENAME COLUMN instructor_en_habilitacion_id TO instructor_validador_id');
    }
};
