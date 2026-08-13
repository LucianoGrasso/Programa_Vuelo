<?php

namespace Tests\Feature;

use App\Models\Instructor;
use App\Models\User;
use App\Models\Vuelo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VueloDosInstructoresTest extends TestCase
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

    private function dosInstructores(): array
    {
        return [
            Instructor::create(['nombre' => 'T1 Uno', 'nombre_combate' => 'UNO']),
            Instructor::create(['nombre' => 'T1 Dos', 'nombre_combate' => 'DOS']),
        ];
    }

    public function test_no_se_pueden_dos_instructores_par_en_una_mision_del_syllabus(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        [$a, $b] = $this->dosInstructores();

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-3D', // misión de alumno
            'instructor_id' => $a->id,
            'instructor_en_habilitacion_id' => $b->id,
            'es_vuelo_habilitacion' => false,
        ])->assertSessionHasErrors('mision');

        $this->assertDatabaseMissing('vuelos', ['mision' => 'PS-3D']);
    }

    public function test_tampoco_se_permiten_dos_instructores_en_mision_del_syllabus_como_habilitacion(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        [$a, $b] = $this->dosInstructores();

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'A-4S', // misión de alumno
            'instructor_id' => $a->id,
            'instructor_en_habilitacion_id' => $b->id,
            'es_vuelo_habilitacion' => true,
        ])->assertSessionHasErrors('mision');

        $this->assertDatabaseMissing('vuelos', ['mision' => 'A-4S']);
    }

    public function test_dos_instructores_pares_se_permiten_en_una_mision_libre_adex(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        [$a, $b] = $this->dosInstructores();

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'ADEX', // misión que no es del syllabus del alumno
            'instructor_id' => $a->id,
            'instructor_en_habilitacion_id' => $b->id,
            'es_vuelo_habilitacion' => false,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $vuelo = Vuelo::first();
        $this->assertSame($a->id, $vuelo->instructor_id);
        $this->assertSame($b->id, $vuelo->instructor_en_habilitacion_id);
        $this->assertFalse($vuelo->es_vuelo_habilitacion);
    }

    public function test_un_solo_instructor_si_puede_volar_una_mision_del_syllabus(): void
    {
        // La regla es solo para DOS instructores: un instructor con su alumno en
        // una misión del programa sigue siendo lo normal.
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = \App\Models\Alumno::create(['nombre' => 'Alumno Uno', 'activo' => true]);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('vuelos', ['mision' => 'PS-3D']);
    }
}
