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

    protected $casts = [
        'aeronaves' => 'array',
        'obs_instructores' => 'array',
        'obs_alumnos' => 'array', // <-- AGREGAR ESTA LÍNEA
    ];
}