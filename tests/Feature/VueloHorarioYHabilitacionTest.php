<?php

namespace Tests\Feature;

use App\Models\Alumno;
use App\Models\Instructor;
use App\Models\NovedadDiaria;
use App\Models\User;
use App\Models\Vuelo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VueloHorarioYHabilitacionTest extends TestCase
{
    use RefreshDatabase;

    private function datosBaseVuelo(): array
    {
        return [
            'fecha' => now()->toDateString(),
            'aeronave' => 'NAVAL 211',
            'mision' => 'PS-3D',
        ];
    }

    public function test_la_eta_no_puede_ser_anterior_a_la_etd(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'etd' => '10:00',
            'eta' => '09:00',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ])->assertSessionHasErrors('eta');
    }

    public function test_la_eta_no_puede_ser_igual_a_la_etd(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'etd' => '10:00',
            'eta' => '10:00',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ])->assertSessionHasErrors('eta');
    }

    public function test_una_eta_posterior_a_la_etd_se_guarda_normal(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'etd' => '09:00',
            'eta' => '10:00',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ])->assertRedirect();

        $this->assertDatabaseHas('vuelos', ['etd' => '09:00', 'eta' => '10:00']);
    }

    public function test_instructor_id_es_quien_ensena_y_instructor_en_habilitacion_es_quien_esta_siendo_validado(): void
    {
        // instructor_id (el "normal") es quien enseña/evalúa; instructor_en_habilitacion_id
        // es el instructor que está siendo validado para poder instruir alumnos.
        $admin = User::factory()->create(['role' => 'admin']);
        $senior = Instructor::create(['nombre' => 'T1 Senior', 'nombre_combate' => 'SENIOR']);
        $aprendiz = Instructor::create(['nombre' => 'T1 Aprendiz', 'nombre_combate' => 'APRENDIZ']);
        NovedadDiaria::create([
            'fecha' => now()->toDateString(),
            'aeronaves' => [['nombre' => 'NAVAL 211', 'estado' => 'baja', 'detalle' => '']],
        ]);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'FTR',
            'etd' => '09:00',
            'eta' => '10:00',
            'instructor_id' => $senior->id,
            'instructor_en_habilitacion_id' => $aprendiz->id,
        ])->assertRedirect();

        $vuelo = Vuelo::first();
        $this->assertSame($senior->id, $vuelo->instructor_id);
        $this->assertSame($aprendiz->id, $vuelo->instructor_en_habilitacion_id);
    }
}
