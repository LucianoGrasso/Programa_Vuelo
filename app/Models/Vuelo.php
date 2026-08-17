<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vuelo extends Model
{
    protected $fillable = [
        'fecha', 'aeronave', 'etd', 'eta', 'mision', 'instructor_id', 'instructor_en_habilitacion_id', 'es_vuelo_habilitacion', 'segundo_instructor_externo', 'alumno_id', 'nota', 'estado_progreso', 'calificacion'
    ];

    protected $casts = [
        'es_vuelo_habilitacion' => 'boolean',
    ];

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class, 'instructor_id');
    }

    /**
     * Segundo instructor del vuelo (columna instructor_en_habilitacion_id). Según
     * el flag es_vuelo_habilitacion puede ser un instructor en habilitación (lo
     * evalúa el instructor_id) o un co-instructor par que vuela junto sin que uno
     * capacite al otro (ej. misiones ADEX).
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