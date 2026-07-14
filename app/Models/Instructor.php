<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Instructor extends Model
{
    protected $table = 'instructores';
    protected $fillable = ['nombre', 'activo', 'nombre_combate', 'numero'];

    // Añade esta relación
    public function vuelos()
    {
        return $this->hasMany(Vuelo::class, 'instructor_id');
    }
}