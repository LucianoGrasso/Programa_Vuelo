<?php

namespace Tests\Feature;

use App\Models\Alumno;
use App\Models\Instructor;
use App\Models\User;
use App\Models\Vuelo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\Fluent\AssertableJson;
use Tests\TestCase;

class VencimientoAlumnoTest extends TestCase
{
    use RefreshDatabase;

    private function crearVuelo(Alumno $alumno, Instructor $instructor, string $fecha, string $estadoProgreso): Vuelo
    {
        return Vuelo::create([
            'fecha' => $fecha,
            'aeronave' => 'NAVAL 211',
            'etd' => '09:00',
            'eta' => '10:00',
            'mision' => 'PS-1D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
            'estado_progreso' => $estadoProgreso,
        ]);
    }

    public function test_alumno_sin_vuelos_no_aparece_vencido(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Alumno::create(['nombre' => 'T2 Nuevo']);

        $this->actingAs($admin)->get(route('alumnos.index'))
            ->assertInertia(fn (AssertableJson $page) => $page
                ->has('alumnos.0', fn (AssertableJson $a) => $a
                    ->where('vencido', false)
                    ->where('dias_sin_volar', null)
                    ->etc()
                )
            );
    }

    public function test_alumno_vencido_a_los_8_dias_sin_volar(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Vencido']);
        $this->crearVuelo($alumno, $instructor, now()->subDays(8)->toDateString(), 'arribado');

        $this->actingAs($admin)->get(route('alumnos.index'))
            ->assertInertia(fn (AssertableJson $page) => $page
                ->has('alumnos.0', fn (AssertableJson $a) => $a
                    ->where('vencido', true)
                    ->where('dias_sin_volar', 8)
                    ->etc()
                )
            );
    }

    public function test_alumno_al_dia_dentro_de_los_7_dias(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Al Dia']);
        $this->crearVuelo($alumno, $instructor, now()->subDays(3)->toDateString(), 'arribado');

        $this->actingAs($admin)->get(route('alumnos.index'))
            ->assertInertia(fn (AssertableJson $page) => $page
                ->has('alumnos.0', fn (AssertableJson $a) => $a
                    ->where('vencido', false)
                    ->where('dias_sin_volar', 3)
                    ->etc()
                )
            );
    }

    public function test_un_vuelo_solo_programado_no_cuenta_para_estar_al_dia(): void
    {
        // Regresión: un vuelo todavía no volado (programado) no debe "limpiar" el
        // vencimiento, porque se puede cancelar. Solo cuenta uno ya arribado.
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Programado']);

        $this->crearVuelo($alumno, $instructor, now()->subDays(20)->toDateString(), 'arribado');
        $this->crearVuelo($alumno, $instructor, now()->toDateString(), 'programado');

        $this->actingAs($admin)->get(route('alumnos.index'))
            ->assertInertia(fn (AssertableJson $page) => $page
                ->has('alumnos.0', fn (AssertableJson $a) => $a
                    ->where('vencido', true)
                    ->where('dias_sin_volar', 20)
                    ->etc()
                )
            );
    }

    public function test_operador_tambien_ve_el_vencimiento(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);
        Alumno::create(['nombre' => 'T2 Base']);

        $this->actingAs($operador)->get(route('alumnos.index'))->assertOk();
    }
}
