<?php

namespace App\Http\Controllers;

use App\Models\Vuelo;
use App\Models\Instructor;
use App\Models\Alumno;
use App\Models\NovedadDiaria;
use Illuminate\Http\Request;

class VueloController extends Controller
{
    public function index()
    {
        $hoy = now()->toDateString();
        $ayer = now()->subDay()->toDateString();

        $vuelos = \App\Models\Vuelo::with(['instructor', 'alumno'])
                       ->where('fecha', '>=', $ayer)
                       ->orderBy('fecha', 'asc')
                       ->orderBy('etd', 'asc')
                       ->get();

        $instructoresActivos = \App\Models\Instructor::where('activo', true)->orderBy('nombre')->get();
        $alumnosActivos = \App\Models\Alumno::where('activo', true)->orderBy('nombre')->get();

        $novedadHoy = \App\Models\NovedadDiaria::where('fecha', $hoy)->first();
        $novedadAyer = \App\Models\NovedadDiaria::where('fecha', $ayer)->first();

        // Historial de Aeronaves
        $ultimaNovedad = \App\Models\NovedadDiaria::whereNotNull('aeronaves')->orderBy('fecha', 'desc')->first();
        $ultimoEstadoAeronaves = $ultimaNovedad ? $ultimaNovedad->aeronaves : null;

        // NUEVO: Historial de Observaciones de Instructores para heredar de día a día
        $ultimaNovedadInst = \App\Models\NovedadDiaria::whereNotNull('obs_instructores')->orderBy('fecha', 'desc')->first();
        $ultimoEstadoInstructores = $ultimaNovedadInst ? $ultimaNovedadInst->obs_instructores : null;

        return inertia('Pizarra/Index', [
            'vuelos' => $vuelos,
            'instructores' => $instructoresActivos,
            'alumnos' => $alumnosActivos,
            'fechaHoy' => $hoy,
            'fechaAyer' => $ayer,
            'novedadHoy' => $novedadHoy,
            'novedadAyer' => $novedadAyer,
            'ultimoEstadoAeronaves' => $ultimoEstadoAeronaves,
            'ultimoEstadoInstructores' => $ultimoEstadoInstructores // <- Pasamos el histórico a React
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'aeronave' => 'required|string|max:255',
            'etd' => 'required|string',
            'eta' => 'required|string',
            'mision' => 'required|string|max:255',
            // NUEVAS REGLAS RELACIONALES:
            'instructor_id' => 'required|exists:instructores,id',
            'alumno_id' => 'required|exists:alumnos,id',
            'nota' => 'nullable|string|max:255',
            'estado_progreso' => 'nullable|string|in:programado,en_vuelo,arribado,cancelado',
        ]);

        Vuelo::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Vuelo $vuelo)
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'aeronave' => 'required|string|max:255',
            'etd' => 'required|string',
            'eta' => 'required|string',
            'mision' => 'required|string|max:255',
            // NUEVAS REGLAS RELACIONALES:
            'instructor_id' => 'required|exists:instructores,id',
            'alumno_id' => 'required|exists:alumnos,id',
            'nota' => 'nullable|string|max:255',
            'estado_progreso' => 'nullable|string|in:programado,en_vuelo,arribado,cancelado',
        ]);

        $vuelo->update($validated);
        return redirect()->back();
    }

    public function storeNovedades(Request $request)
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'obs_instructores' => 'nullable|array',
            'obs_alumnos' => 'nullable|array', // <-- CAMBIAR DE 'string' A 'array'
            'aeronaves' => 'nullable|array',
            'piloto_servicio' => 'nullable|string',
        ]);

        \App\Models\NovedadDiaria::updateOrCreate(
            ['fecha' => $validated['fecha']],
            $validated
        );

        return redirect()->back();
    }

    public function historial()
    {
        // Añadimos el "with" para que Laravel traiga los nombres de instructores y alumnos
        $vuelos = \App\Models\Vuelo::with(['instructor', 'alumno'])
            ->orderBy('fecha', 'desc')
            ->orderBy('etd', 'desc')
            ->get();

        return inertia('Pizarra/Historial', [
            'vuelos' => $vuelos
        ]);
    }
}