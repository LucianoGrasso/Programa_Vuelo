<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NovedadDiaria extends Model
{
    protected $table = 'novedades_diarias';

    protected $fillable = [
        'fecha',
        'obs_instructores',
        'obs_alumnos',
        'aeronaves',
        'piloto_servicio'
    ];

    // AÑADE ESTO PARA GUARDAR EL ARREGLO COMO JSON AUTOMÁTICAMENTE
    protected $casts = [
        'aeronaves' => 'array',
    ];
}