<?php

namespace Tests\Feature;

use App\Models\Alumno;
use App\Models\Instructor;
use App\Models\User;
use App\Models\Vuelo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VueloSoloTest extends TestCase
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

    public function test_alumno_no_puede_volar_solo_en_mision_que_exige_instructor(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-3D', // no termina en S: exige instructor
            'alumno_id' => $alumno->id,
            'instructor_id' => null,
        ])->assertSessionHasErrors('mision');

        $this->assertDatabaseMissing('vuelos', ['mision' => 'PS-3D']);
    }

    public function test_alumno_puede_volar_solo_en_mision_designada_como_solo(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-17S', // termina en S: misión de solo
            'alumno_id' => $alumno->id,
            'instructor_id' => null,
        ])->assertRedirect();

        $this->assertDatabaseHas('vuelos', ['mision' => 'PS-17S', 'instructor_id' => null]);
    }

    public function test_instructor_puede_volar_solo_sin_alumno_para_ftr(): void
    {
        // El FTR (instructor validando una aeronave que salió de mantención) no
        // lleva alumno, y no está sujeto a la regla de misión "solo" porque esa
        // regla es específica de cuando el que vuela solo es el alumno.
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'FTR',
            'instructor_id' => $instructor->id,
            'alumno_id' => null,
        ])->assertRedirect();

        $this->assertDatabaseHas('vuelos', ['mision' => 'FTR', 'alumno_id' => null]);
    }

    public function test_no_puede_editar_un_vuelo_para_dejarlo_solo_en_mision_no_solo(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        $vuelo = Vuelo::create([
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ]);

        $this->actingAs($admin)->put(route('pizarra.update', $vuelo), [
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-3D',
            'alumno_id' => $alumno->id,
            'instructor_id' => null,
        ])->assertSessionHasErrors('mision');
    }
}
