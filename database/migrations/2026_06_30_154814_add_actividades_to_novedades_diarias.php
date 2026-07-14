<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('novedades_diarias', function (Blueprint $table) {
            $table->text('actividades')->nullable()->after('piloto_servicio');
        });
    }

    public function down(): void
    {
        Schema::table('novedades_diarias', function (Blueprint $table) {
            $table->dropColumn('actividades');
        });
    }
};