<?php

namespace Tests\Feature;

use App\Models\Alumno;
use App\Models\Instructor;
use App\Models\User;
use App\Models\Vuelo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VueloTresOcupantesTest extends TestCase
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

    public function test_no_se_puede_llevar_instructor_alumno_y_segundo_instructor_de_la_ficha_a_la_vez(): void
    {
        // Con una misión LIBRE (no del syllabus) a propósito: esto tiene que
        // bloquearse igual, no es solo la regla de "misión de alumno".
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Uno', 'nombre_combate' => 'UNO']);
        $segundo = Instructor::create(['nombre' => 'T1 Dos', 'nombre_combate' => 'DOS']);
        $alumno = Alumno::create(['nombre' => 'Alumno Uno', 'activo' => true]);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'FERRY',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
            'instructor_en_habilitacion_id' => $segundo->id,
        ])->assertSessionHasErrors('alumno_id');

        $this->assertDatabaseMissing('vuelos', ['mision' => 'FERRY']);
    }

    public function test_no_se_puede_llevar_instructor_alumno_y_segundo_instructor_externo_a_la_vez(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Uno', 'nombre_combate' => 'UNO']);
        $alumno = Alumno::create(['nombre' => 'Alumno Uno', 'activo' => true]);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'FERRY',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
            'segundo_instructor_externo' => 'Tte. Fuentes (VC-1)',
        ])->assertSessionHasErrors('alumno_id');

        $this->assertDatabaseMissing('vuelos', ['mision' => 'FERRY']);
    }

    public function test_no_se_puede_editar_un_vuelo_para_agregarle_un_tercer_ocupante(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Uno', 'nombre_combate' => 'UNO']);
        $segundo = Instructor::create(['nombre' => 'T1 Dos', 'nombre_combate' => 'DOS']);
        $alumno = Alumno::create(['nombre' => 'Alumno Uno', 'activo' => true]);

        $vuelo = Vuelo::create([
            ...$this->datosBaseVuelo(),
            'mision' => 'FERRY',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ]);

        $this->actingAs($admin)->put(route('pizarra.update', $vuelo->id), [
            ...$this->datosBaseVuelo(),
            'mision' => 'FERRY',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
            'instructor_en_habilitacion_id' => $segundo->id,
        ])->assertSessionHasErrors('alumno_id');

        $this->assertDatabaseHas('vuelos', ['id' => $vuelo->id, 'instructor_en_habilitacion_id' => null]);
    }

    public function test_instructor_y_alumno_solos_sigue_funcionando(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Uno', 'nombre_combate' => 'UNO']);
        $alumno = Alumno::create(['nombre' => 'Alumno Uno', 'activo' => true]);

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('vuelos', ['mision' => 'PS-3D']);
    }
}
