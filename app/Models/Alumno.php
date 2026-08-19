<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alumno extends Model
{
    protected $table = 'alumnos';
    protected $fillable = ['nombre', 'activo', 'email', 'recibe_notam'];

    protected $casts = [
        'activo' => 'boolean',
        'recibe_notam' => 'boolean',
    ];

    // Añade esta relación
    public function vuelos()
    {
        return $this->hasMany(Vuelo::class, 'alumno_id');
    }
}