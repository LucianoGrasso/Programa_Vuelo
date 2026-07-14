<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('instructores', function (Blueprint $table) {
            $table->string('nombre_combate')->nullable()->after('nombre');
        });
    }

    public function down(): void
    {
        Schema::table('instructores', function (Blueprint $table) {
            $table->dropColumn('nombre_combate');
        });
    }
};