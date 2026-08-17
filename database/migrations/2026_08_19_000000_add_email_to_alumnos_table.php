<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumnos', function (Blueprint $table) {
            // Para el envío diario de NOTAM por correo (comando notam:enviar). Nullable:
            // no todos los alumnos van a tener el email cargado desde el día uno.
            $table->string('email')->nullable()->after('nombre');
        });
    }

    public function down(): void
    {
        Schema::table('alumnos', function (Blueprint $table) {
            $table->dropColumn('email');
        });
    }
};
