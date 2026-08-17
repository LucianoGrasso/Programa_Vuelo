<?php

namespace App\Http\Controllers;

use App\Models\Vuelo;
use App\Models\Instructor;
use App\Models\Alumno;
use App\Models\NovedadDiaria;
use App\Support\SyllabusMisiones;
use Illuminate\Http\Request;

class VueloController extends Controller
{
    /**
     * Cuando el alumno vuela solo (sin instructor), la misión tiene que ser una
     * de las designadas como "solo" en el syllabus (código terminado en "S", ej.
     * PS-17S, P-2S, A-4S) — no cualquier misión que normalmente exige instructor.
     */
    private function reglaMisionSolo(Request $request): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($request) {
            $esVueloSoloDeAlumno = empty($request->input('instructor_id')) && filled($request->input('alumno_id'));

            if ($esVueloSoloDeAlumno && !str_ends_with(strtoupper($value), 'S')) {
                $fail('Un vuelo solo (alumno sin instructor) solo se puede registrar en una misión de tipo solo (código terminado en "S").');
            }
        };
    }

    /**
     * Un alumno no puede tener dos vuelos con el mismo código de misión: los
     * códigos EX REP 1-4 son justamente los que existen para repetir, así que
     * quedan afuera de esta regla. $vueloIdActual se excluye para permitir
     * guardar una edición sin que choque contra sí mismo.
     */
    private function reglaMisionDuplicada(Request $request, ?int $vueloIdActual = null): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($request, $vueloIdActual) {
            $alumnoId = $request->input('alumno_id');

            if (!$alumnoId || str_starts_with(strtoupper(trim($value)), 'EX REP')) {
                return;
            }

            $existe = Vuelo::where('alumno_id', $alumnoId)
                ->whereRaw('UPPER(mision) = ?', [strtoupper($value)])
                ->when($vueloIdActual, fn ($query) => $query->where('id', '!=', $vueloIdActual))
                ->exists();

            if ($existe) {
                $fail("Este alumno ya tiene un vuelo registrado con el código \"{$value}\". Si es una repetición, usá un código EX REP.");
            }
        };
    }

    /**
     * Estado actual de una aeronave según el tablero de Novedades del Día: el de
     * hoy si tiene datos propios, si no el último registrado (mismo criterio que
     * ya usa el tablero para pintar la aeronave como disponible/de baja).
     */
    private function estadoActualAeronave(string $aeronave): string
    {
        $novedadHoy = NovedadDiaria::where('fecha', now()->toDateString())->first();
        $aeronaves = ($novedadHoy && is_array($novedadHoy->aeronaves) && count($novedadHoy->aeronaves) > 0)
            ? $novedadHoy->aeronaves
            : (NovedadDiaria::whereNotNull('aeronaves')->orderBy('fecha', 'desc')->first(['aeronaves'])?->aeronaves ?? []);

        foreach ($aeronaves as $item) {
            if (($item['nombre'] ?? null) === $aeronave) {
                return $item['estado'] ?? 'disponible';
            }
        }

        // Aeronaves que no están en el tablero (ej. SIM) se consideran disponibles.
        return 'disponible';
    }

    /**
     * Una aeronave de baja solo puede volar con código FTR (es justo el vuelo que
     * la saca de ese estado), y el código FTR es exclusivo de una aeronave de baja.
     */
    private function reglaAeronaveDeBajaSoloFtr(Request $request): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($request) {
            $aeronave = $request->input('aeronave');

            if (!$aeronave || $aeronave === 'SIM') {
                return;
            }

            $esDeBaja = $this->estadoActualAeronave($aeronave) === 'baja';
            $esFtr = strtoupper(trim($value)) === 'FTR';

            if ($esDeBaja && !$esFtr) {
                $fail('Esta aeronave está de baja: solo se le puede registrar un vuelo con código FTR.');
            }

            if ($esFtr && !$esDeBaja) {
                $fail('El código FTR es solo para una aeronave que está de baja.');
            }
        };
    }

    /**
     * ¿El vuelo tiene un segundo instructor? Puede ser de la ficha (de la escuela)
     * o externo (nombre libre) — los dos casos son "dos instructores volando".
     */
    private function haySegundoInstructor(Request $request): bool
    {
        return filled($request->input('instructor_en_habilitacion_id')) || filled($request->input('segundo_instructor_externo'));
    }

    /**
     * Un vuelo con dos instructores (instructor_id + un segundo instructor, sea de
     * la ficha o externo, par o en habilitación) no puede registrarse en una misión
     * del programa del alumno: esas misiones son evaluaciones que van en la matriz.
     */
    private function reglaDosInstructoresNoEnSyllabus(Request $request): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($request) {
            if ($this->haySegundoInstructor($request) && SyllabusMisiones::esDeSyllabus($value)) {
                $fail('No se puede registrar un vuelo de dos instructores en una misión del programa del alumno.');
            }
        };
    }

    /**
     * El segundo instructor es o de la ficha (instructor_en_habilitacion_id) o
     * externo (nombre libre): nunca los dos a la vez.
     */
    private function reglaSegundoInstructorExclusivo(Request $request): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($request) {
            if (filled($value) && filled($request->input('instructor_en_habilitacion_id'))) {
                $fail('El segundo instructor no puede ser de la ficha y externo a la vez.');
            }
        };
    }

    /**
     * La habilitación es siempre interna: un instructor de la escuela evaluando a
     * otro instructor de la escuela. No aplica cuando el segundo instructor es
     * externo (nombre libre, sin ficha).
     */
    private function reglaHabilitacionSoloConSegundoInstructorInterno(Request $request): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($request) {
            if ($request->boolean('es_vuelo_habilitacion') && filled($request->input('segundo_instructor_externo'))) {
                $fail('El vuelo de habilitación no aplica a un segundo instructor externo.');
            }
        };
    }

    /**
     * La hora de llegada (ETA) tiene que ser posterior a la de salida (ETD).
     * Ambas llegan como strings "HH:MM", así que la comparación de texto
     * alcanza (formato de 24hs con cero a la izquierda).
     */
    private function reglaHorarioCoherente(Request $request): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($request) {
            $etd = $request->input('etd');

            if ($etd && $value && $value <= $etd) {
                $fail('La hora de llegada (ETA) tiene que ser posterior a la hora de salida (ETD).');
            }
        };
    }

    public function index()
    {
        $hoy = now()->toDateString();
        $ayer = now()->subDay()->toDateString();

        $vuelos = \App\Models\Vuelo::with(['instructor', 'instructorEnHabilitacion', 'alumno'])
                       ->where('fecha', '>=', $ayer)
                       ->orderBy('fecha', 'asc')
                       ->orderBy('etd', 'asc')
                       ->get();

        $instructoresActivos = \App\Models\Instructor::where('activo', true)->orderByRaw('numero IS NULL, numero ASC')->get();
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
     * obs_alumnos), el valor del registro más reciente — sea cual sea su contenido.
     *
     * A propósito NO nos saltamos los días "en blanco": si alguien borró una
     * observación y guardó, ese día en blanco es el estado real más reciente y
     * tiene que ganar. Saltarlo para buscar el último día con contenido real
     * resucitaba notas viejas ya borradas al día siguiente (bug real, corregido
     * acá). Mismo criterio que ya usa el historial de aeronaves.
     */
    private function ultimoEstadoObservaciones(string $columna): ?array
    {
        $ultimaNovedad = \App\Models\NovedadDiaria::whereNotNull($columna)
            ->orderBy('fecha', 'desc')
            ->first(['fecha', $columna]);

        return $ultimaNovedad?->{$columna};
    }

    public function store(Request $request)
    {
        // El "Ingreso Manual de Evaluación" registra una cruz de matriz histórica con
        // una aeronave de relleno (no un vuelo operativo del día), así que no debe pasar
        // por la regla de aeronave de baja/FTR — mismo criterio que la carga rápida.
        $esEvaluacionManual = $request->boolean('es_evaluacion_manual');

        $reglasMision = ['required', 'string', 'max:255', $this->reglaMisionSolo($request), $this->reglaMisionDuplicada($request), $this->reglaDosInstructoresNoEnSyllabus($request)];
        if (!$esEvaluacionManual) {
            $reglasMision[] = $this->reglaAeronaveDeBajaSoloFtr($request);
        }

        $validated = $request->validate([
            'fecha' => 'required|date',
            'aeronave' => 'required|string|max:255',
            'etd' => 'required|string',
            'eta' => ['required', 'string', $this->reglaHorarioCoherente($request)],
            'mision' => $reglasMision,
            // Vuelo solo: puede volar el alumno sin instructor (primer solo) o el
            // instructor sin alumno (FTR de una aeronave saliendo de mantención),
            // pero no puede faltar los dos a la vez.
            'instructor_id' => 'nullable|required_without:alumno_id|exists:instructores,id',
            // Segundo instructor: puede ser un instructor de la ficha (en habilitación
            // o par, ej. ADEX) o alguien externo a la escuela (segundo_instructor_externo,
            // nombre libre, sin ficha) — mutuamente excluyentes entre sí. El flag
            // es_vuelo_habilitacion distingue par/habilitación y no aplica a un externo.
            'instructor_en_habilitacion_id' => 'nullable|different:instructor_id|exists:instructores,id',
            'segundo_instructor_externo' => ['nullable', 'string', 'max:255', $this->reglaSegundoInstructorExclusivo($request)],
            'es_vuelo_habilitacion' => ['nullable', 'boolean', $this->reglaHabilitacionSoloConSegundoInstructorInterno($request)],
            'alumno_id' => 'nullable|required_without:instructor_id|exists:alumnos,id',
            'nota' => 'nullable|string|max:255',
            'estado_progreso' => 'nullable|string|in:programado,en_vuelo,arribado,cancelado',
            'calificacion' => 'nullable|string|in:pendiente,aprobado,reprobado',
        ]);

        Vuelo::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Vuelo $vuelo)
    {
        // Igual que en store(): editar una cruz de matriz histórica (desde el modal
        // de Evaluaciones) tampoco debe pasar por la regla operativa de aeronave de
        // baja/FTR, sea cual sea el estado actual de la aeronave de relleno.
        $esEvaluacionManual = $request->boolean('es_evaluacion_manual');

        $reglasMision = ['required', 'string', 'max:255', $this->reglaMisionSolo($request), $this->reglaMisionDuplicada($request, $vuelo->id), $this->reglaDosInstructoresNoEnSyllabus($request)];
        if (!$esEvaluacionManual) {
            $reglasMision[] = $this->reglaAeronaveDeBajaSoloFtr($request);
        }

        $validated = $request->validate([
            'fecha' => 'required|date',
            'aeronave' => 'required|string|max:255',
            'etd' => 'required|string',
            'eta' => ['required', 'string', $this->reglaHorarioCoherente($request)],
            'mision' => $reglasMision,
            // Vuelo solo: puede volar el alumno sin instructor (primer solo) o el
            // instructor sin alumno (FTR de una aeronave saliendo de mantención),
            // pero no puede faltar los dos a la vez.
            'instructor_id' => 'nullable|required_without:alumno_id|exists:instructores,id',
            'instructor_en_habilitacion_id' => 'nullable|different:instructor_id|exists:instructores,id',
            'segundo_instructor_externo' => ['nullable', 'string', 'max:255', $this->reglaSegundoInstructorExclusivo($request)],
            'es_vuelo_habilitacion' => ['nullable', 'boolean', $this->reglaHabilitacionSoloConSegundoInstructorInterno($request)],
            'alumno_id' => 'nullable|required_without:instructor_id|exists:alumnos,id',
            'nota' => 'nullable|string|max:255',
            'estado_progreso' => 'nullable|string|in:programado,en_vuelo,arribado,cancelado',
            'calificacion' => 'nullable|string|in:pendiente,aprobado,reprobado',
        ]);

        $vuelo->update($validated);
        return redirect()->back();
    }

    public function destroy(Vuelo $vuelo)
    {
        $vuelo->delete();
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
        $vuelos = \App\Models\Vuelo::with(['instructor', 'instructorEnHabilitacion', 'alumno'])
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

        $instructoresActivos = \App\Models\Instructor::where('activo', true)->orderByRaw('numero IS NULL, numero ASC')->get();

        return inertia('Pizarra/Evaluaciones', [
            'alumnos' => $alumnos,
            'instructores' => $instructoresActivos,
        ]);
    }

    public function cargaRapida()
    {
        return inertia('Pizarra/CargaRapida', [
            'alumnos' => \App\Models\Alumno::orderBy('nombre')->get(),
            'instructores' => \App\Models\Instructor::orderByRaw('numero IS NULL, numero ASC')->get(),
        ]);
    }

    /**
     * Carga en lote de vuelos ya volados (ej. traspaso de un pizarrón físico).
     * No pasa por los campos operativos del vuelo del día (aeronave/etd/eta): esos
     * datos no se registraron en su momento, así que se completan con un valor
     * fijo, igual que ya hace el modal de "Ingreso Manual de Evaluación".
     */
    public function storeBulk(Request $request)
    {
        $validated = $request->validate([
            'vuelos' => 'required|array|min:1',
            'vuelos.*.fecha' => 'required|date',
            'vuelos.*.mision' => 'required|string|max:255',
            'vuelos.*.instructor_id' => 'required|exists:instructores,id',
            'vuelos.*.alumno_id' => 'required|exists:alumnos,id',
            'vuelos.*.nota' => 'nullable|string|max:255',
            'vuelos.*.calificacion' => 'required|string|in:pendiente,aprobado,reprobado',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
            foreach ($validated['vuelos'] as $fila) {
                Vuelo::create([
                    'fecha' => $fila['fecha'],
                    'aeronave' => 'NAVAL 211',
                    'etd' => '00:00',
                    'eta' => '01:00',
                    'mision' => $fila['mision'],
                    'instructor_id' => $fila['instructor_id'],
                    'alumno_id' => $fila['alumno_id'],
                    'nota' => $fila['nota'] ?? null,
                    'estado_progreso' => 'arribado',
                    'calificacion' => $fila['calificacion'],
                ]);
            }
        });

        return redirect()->back();
    }
}