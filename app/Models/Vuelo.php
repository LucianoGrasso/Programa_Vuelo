<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vuelo extends Model
{
    protected $fillable = [
        'fecha', 'aeronave', 'etd', 'eta', 'mision', 'instructor_id', 'instructor_validador_id', 'alumno_id', 'nota', 'estado_progreso', 'calificacion'
    ];

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class, 'instructor_id');
    }

    public function instructorValidador(): BelongsTo
    {
        return $this->belongsTo(Instructor::class, 'instructor_validador_id');
    }

    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class, 'alumno_id');
    }
}