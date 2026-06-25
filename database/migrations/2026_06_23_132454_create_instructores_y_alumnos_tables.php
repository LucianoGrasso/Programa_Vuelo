<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: "T1 Raby"
            $table->boolean('activo')->default(true); // Control de año a año
            $table->timestamps();
        });

        Schema::create('alumnos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre'); // Ej: "T2 Laymuns"
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructores');
        Schema::dropIfExists('alumnos');
    }
};