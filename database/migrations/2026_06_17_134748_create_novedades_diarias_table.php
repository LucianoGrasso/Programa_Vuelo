<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('novedades_diarias', function (Blueprint $table) {
            $table->id();
            $table->date('fecha')->unique(); // Una única fila de novedades por día
            $table->text('obs_instructores')->nullable();
            $table->text('obs_alumnos')->nullable();
            $table->text('aeronaves')->nullable();
            $table->text('piloto_servicio')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('novedades_diarias');
    }
};
