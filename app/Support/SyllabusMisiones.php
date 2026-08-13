<?php

namespace App\Support;

/**
 * Códigos de misión que pertenecen al programa del alumno (syllabus).
 *
 * IMPORTANTE: esta lista es el espejo backend de ETAPAS_CURSO en el frontend
 * (resources/js/Pages/Pizarra/Evaluaciones.jsx y Index.jsx). Si se agrega o
 * saca una misión del syllabus allá, actualizar también acá.
 *
 * Sirve para validar que un vuelo de dos instructores no use una misión de
 * alumno: esas misiones son evaluaciones que van en la matriz del alumno, no
 * vuelos de instructor (ADEX/habilitación). Los códigos EX REP (repeticiones)
 * aparecen una sola vez.
 */
class SyllabusMisiones
{
    public const CODIGOS = [
        // Pre Solo
        'SPS-1D', 'PS-1D', 'SPS-2D', 'PS-2D', 'PS-3D', 'SPS-3D', 'PS-4D', 'PS-5D', 'SPS-4D', 'PS-6D',
        'PS-7D', 'PS-8D', 'PS-9D', 'SPS-5D', 'PS-10D', 'PS-11D', 'PS-12D', 'PS-13D', 'PS-14D', 'PS-15D',
        'PS-16D', 'PS-17DX', 'PS-17S',
        // Precisión
        'SP-1D', 'P-1D', 'P-2S', 'P-3D', 'P-4S', 'P-5D', 'P-6S', 'P-7D', 'P-8S', 'P-9D', 'P-10S', 'P-11D', 'P-12DX',
        // Acrobacias
        'A-1D', 'A-2D', 'A-3D', 'A-4S', 'A-5D', 'A-6S', 'A-7D', 'A-8S', 'A-9D', 'A-10DX',
        // Navegación
        'SNV-1D', 'NV-1D', 'NV-2D', 'NV-3D', 'NV-4D', 'NV-5D', 'NV-6DX',
        // Instrumentos Básicos
        'SIB-1D', 'IB-1D', 'SIB-2D', 'IB-2D', 'SIB-3D', 'IB-3D', 'SIB-4D', 'IB-4D', 'SIB-5D', 'IB-5D', 'SIB-6D', 'IB-6DX',
        // Radio Instrumento
        'SRI-1D', 'RI-1D', 'SRI-2D', 'RI-2D', 'SRI-3D', 'RI-3D', 'SRI-4D', 'RI-4D', 'SRI-5D', 'RI-5D', 'SRI-6D', 'RI-6D',
        'SRI-7D', 'RI-7D', 'SRI-8D', 'RI-8D', 'SRI-9D', 'RI-9D', 'RI-10D', 'RI-11D', 'RI-12D', 'RI-13D', 'RI-14D', 'RI-15D', 'RI-16DX',
        // Formación
        'F-1D', 'F-2D', 'F-3D', 'F-4D', 'F-5D', 'F-6D', 'F-7D', 'F-8DX',
        // Nocturno
        'N-1D', 'N-2D', 'N-3D', 'N-4DX',
        // Repeticiones (comunes a todas las etapas)
        'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4',
    ];

    /**
     * ¿La misión pertenece al programa del alumno? Compara sin distinguir
     * mayúsculas ni espacios sobrantes, igual que las demás reglas de misión.
     */
    public static function esDeSyllabus(?string $mision): bool
    {
        if (! $mision) {
            return false;
        }

        $normalizada = strtoupper(trim($mision));

        return in_array($normalizada, self::CODIGOS, true);
    }
}
