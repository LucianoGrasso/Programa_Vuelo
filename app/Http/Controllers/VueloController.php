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

        // Historial de Observaciones (instructores y alumnos) para heredar de día a
        // día: algunas observaciones valen para toda la semana, no queremos que se
        // "vacíen" solas al pasar la medianoche.
        $ultimoEstadoInstructores = $this->ultimoEstadoObservaciones('obs_instructores');
        $ultimoEstadoAlumnos = $this->ultimoEstadoObservaciones('obs_alumnos');

        return inertia('Pizarra/Index', [
            'vuelos' => $vuelos,
            'instructores' => $instructoresActivos,
            'alumnos' => $alumnosActivos,
            'fechaHoy' => $hoy,
            'fechaAyer' => $ayer,
            'novedadHoy' => $novedadHoy,
            'novedadAyer' => $novedadAyer,
            'ultimoEstadoAeronaves' => $ultimoEstadoAeronaves,
            'ultimoEstadoInstructores' => $ultimoEstadoInstructores,
            'ultimoEstadoAlumnos' => $ultimoEstadoAlumnos,
        ]);
    }

    /**
     * Busca, para una columna de observaciones de NovedadDiaria (obs_instructores u
     * obs_alumnos), el registro no vacío más reciente. No alcanza con que la columna
     * no sea null: un día sin ninguna observación cargada igual guarda un array con
     * "observacion" en null para cada persona, y no queremos que ese día en blanco
     * tape la última observación real de un día anterior.
     */
    private function ultimoEstadoObservaciones(string $columna): ?array
    {
        $ultimaNovedad = \App\Models\NovedadDiaria::whereNotNull($columna)
            ->orderBy('fecha', 'desc')
            ->get(['fecha', $columna])
            ->first(fn ($novedad) => collect($novedad->{$columna})
                ->contains(fn ($obs) => filled($obs['observacion'] ?? null)));

        return $ultimaNovedad?->{$columna};
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
            'calificacion' => 'nullable|string|in:pendiente,aprobado,reprobado',
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
            'calificacion' => 'nullable|string|in:pendiente,aprobado,reprobado',
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
            'actividades' => 'nullable|string',
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
    
    public function evaluaciones()
    {
        // Traemos a los alumnos activos con su historial de vuelos y los instructores de esos vuelos
        $alumnos = \App\Models\Alumno::where('activo', true)
            ->with(['vuelos.instructor'])
            ->orderBy('nombre')
            ->get();

        $instructoresActivos = \App\Models\Instructor::where('activo', true)->orderBy('nombre')->get();

        return inertia('Pizarra/Evaluaciones', [
            'alumnos' => $alumnos,
            'instructores' => $instructoresActivos,
        ]);
    }
}