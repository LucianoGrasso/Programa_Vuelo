<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vuelo extends Model
{
    protected $fillable = [
        'fecha', 'aeronave', 'etd', 'eta', 'mision', 'instructor_id', 'instructor_en_habilitacion_id', 'alumno_id', 'nota', 'estado_progreso', 'calificacion'
    ];

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class, 'instructor_id');
    }

    /**
     * Vuelo de habilitación: instructor_id es quien enseña/evalúa; este es el
     * instructor que está siendo habilitado (evaluado) por ese instructor_id.
     */
    public function instructorEnHabilitacion(): BelongsTo
    {
        return $this->belongsTo(Instructor::class, 'instructor_en_habilitacion_id');
    }

    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class, 'alumno_id');
    }
}