<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use Illuminate\Http\Request;

class AlumnoController extends Controller
{
    const DIAS_LIMITE_SIN_VOLAR = 7;

    public function index()
    {
        // Añadimos withCount('vuelos') para los alumnos, y withMax para saber la
        // fecha de su último vuelo sin traer todo el historial. Para el vencimiento
        // solo cuenta un vuelo que ya se voló (arribado): uno "programado" todavía
        // se puede cancelar, así que no alcanza para poner al alumno al día.
        $alumnos = Alumno::withCount('vuelos')
            ->withMax(['vuelos as ultimo_vuelo_completado' => function ($query) {
                $query->where('estado_progreso', 'arribado');
            }], 'fecha')
            ->orderBy('nombre')
            ->get()
            ->map(function (Alumno $alumno) {
                $ultimoVuelo = $alumno->ultimo_vuelo_completado;
                // Carbon 3 devuelve la diferencia con signo (negativo si la fecha
                // es pasada); acá siempre queremos la cantidad de días, absoluta.
                $diasSinVolar = $ultimoVuelo ? now()->startOfDay()->diffInDays($ultimoVuelo, true) : null;

                $alumno->ultimo_vuelo = $ultimoVuelo;
                $alumno->dias_sin_volar = $diasSinVolar;
                // Un alumno que todavía no voló nunca no está "vencido": ese aviso
                // es para quien perdió continuidad, no para quien no empezó.
                $alumno->vencido = $diasSinVolar !== null && $diasSinVolar > self::DIAS_LIMITE_SIN_VOLAR;

                return $alumno;
            });

        return inertia('Dotacion/Alumnos', [
            'alumnos' => $alumnos
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:alumnos',
            'activo' => 'boolean',
            // Opcional: sin email, el alumno simplemente no recibe el NOTAM diario
            // (comando notam:enviar).
            'email' => 'nullable|email|max:255',
        ]);

        Alumno::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Alumno $alumno)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:alumnos,nombre,' . $alumno->id,
            'activo' => 'boolean',
            'email' => 'nullable|email|max:255',
        ]);

        $alumno->update($validated);
        return redirect()->back();
    }
}