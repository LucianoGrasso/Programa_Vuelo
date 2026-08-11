<?php

namespace Tests\Feature;

use App\Models\Alumno;
use App\Models\Instructor;
use App\Models\User;
use App\Models\Vuelo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VueloMisionDuplicadaTest extends TestCase
{
    use RefreshDatabase;

    private function datosBaseVuelo(): array
    {
        return [
            'fecha' => now()->toDateString(),
            'aeronave' => 'NAVAL 211',
            'etd' => '09:00',
            'eta' => '10:00',
        ];
    }

    public function test_no_se_puede_repetir_el_mismo_codigo_de_mision_para_el_mismo_alumno(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        Vuelo::create([
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ]);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'ps-3d', // mismo código, distinta capitalización
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ])->assertSessionHasErrors('mision');

        $this->assertSame(1, Vuelo::where('alumno_id', $alumno->id)->where('mision', 'PS-3D')->count());
    }

    public function test_el_mismo_codigo_si_se_permite_para_otro_alumno(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumnoUno = Alumno::create(['nombre' => 'T2 Uno']);
        $alumnoDos = Alumno::create(['nombre' => 'T2 Dos']);

        Vuelo::create([
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumnoUno->id,
        ]);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumnoDos->id,
        ])->assertRedirect();

        $this->assertDatabaseHas('vuelos', ['mision' => 'PS-3D', 'alumno_id' => $alumnoDos->id]);
    }

    public function test_los_codigos_ex_rep_se_pueden_repetir(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        Vuelo::create([
            ...$this->datosBaseVuelo(),
            'mision' => 'EX REP 1',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ]);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'EX REP 1',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ])->assertRedirect();

        $this->assertSame(2, Vuelo::where('alumno_id', $alumno->id)->where('mision', 'EX REP 1')->count());
    }

    public function test_editar_un_vuelo_sin_cambiar_su_propia_mision_no_choca_con_si_mismo(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        $vuelo = Vuelo::create([
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
            'nota' => 'R-1',
        ]);

        $this->actingAs($admin)->put(route('pizarra.update', $vuelo), [
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
            'nota' => 'R-35',
        ])->assertRedirect();

        $this->assertDatabaseHas('vuelos', ['id' => $vuelo->id, 'nota' => 'R-35']);
    }
}
