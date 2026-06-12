<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vuelos', function (Blueprint $table) {
            $table->id();
            $table->date('fecha'); // Para agrupar los vuelos por día en la vista
            
            // Las columnas exactas de tu pizarra
            $table->string('aeronave'); // Ej: N-215, N-217, SIM
            $table->time('etd');        // Hora estimada de salida (09:30)
            $table->time('eta');        // Hora estimada de llegada (11:00)
            $table->string('mision');   // Ej: PS-3D, MT, SPS-3D
            $table->string('dotacion'); // Ej: SATURNO/T2 Widow
            $table->string('nota')->nullable(); // Ej: R-67, checkmarks. Nullable por si queda en blanco
            
            $table->timestamps(); // Guarda cuándo se creó o modificó el registro
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vuelos');
    }
};
