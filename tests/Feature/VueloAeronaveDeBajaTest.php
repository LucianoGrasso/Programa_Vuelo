<?php

namespace Tests\Feature;

use App\Models\Instructor;
use App\Models\NovedadDiaria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VueloAeronaveDeBajaTest extends TestCase
{
    use RefreshDatabase;

    private function datosBaseVuelo(): array
    {
        return [
            'fecha' => now()->toDateString(),
            'etd' => '09:00',
            'eta' => '10:00',
        ];
    }

    private function marcarAeronaveDeBaja(string $aeronave): void
    {
        NovedadDiaria::create([
            'fecha' => now()->toDateString(),
            'aeronaves' => [['nombre' => $aeronave, 'estado' => 'baja', 'detalle' => '']],
        ]);
    }

    public function test_no_se_puede_volar_una_aeronave_de_baja_con_otro_codigo_que_no_sea_ftr(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $this->marcarAeronaveDeBaja('NAVAL 211');

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'aeronave' => 'NAVAL 211',
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
        ])->assertSessionHasErrors('mision');

        $this->assertDatabaseMissing('vuelos', ['aeronave' => 'NAVAL 211', 'mision' => 'PS-3D']);
    }

    public function test_el_codigo_ftr_no_se_puede_usar_en_una_aeronave_disponible(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        // Ninguna novedad cargada: NAVAL 212 está disponible por defecto.

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'aeronave' => 'NAVAL 212',
            'mision' => 'FTR',
            'instructor_id' => $instructor->id,
        ])->assertSessionHasErrors('mision');

        $this->assertDatabaseMissing('vuelos', ['aeronave' => 'NAVAL 212', 'mision' => 'FTR']);
    }

    public function test_ftr_en_la_aeronave_de_baja_correspondiente_si_funciona(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $this->marcarAeronaveDeBaja('NAVAL 213');

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'aeronave' => 'NAVAL 213',
            'mision' => 'FTR',
            'instructor_id' => $instructor->id,
        ])->assertRedirect();

        $this->assertDatabaseHas('vuelos', ['aeronave' => 'NAVAL 213', 'mision' => 'FTR']);
    }

    public function test_una_aeronave_no_marcada_de_baja_vuela_normal(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $this->marcarAeronaveDeBaja('NAVAL 211'); // solo esta queda de baja

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'aeronave' => 'NAVAL 215', // otra aeronave, sigue disponible
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
        ])->assertRedirect();

        $this->assertDatabaseHas('vuelos', ['aeronave' => 'NAVAL 215', 'mision' => 'PS-3D']);
    }

    public function test_una_evaluacion_manual_se_registra_aunque_la_aeronave_de_relleno_este_de_baja(): void
    {
        // El "Ingreso Manual de Evaluación" es una cruz de matriz histórica: usa una
        // aeronave de relleno (NAVAL 211) y no debe pasar por la regla operativa de
        // aeronave de baja, igual que ya lo hace la carga rápida (storeBulk).
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = \App\Models\Alumno::create(['nombre' => 'Alumno Uno', 'activo' => true]);
        $this->marcarAeronaveDeBaja('NAVAL 211'); // la aeronave de relleno del modal

        $this->actingAs($admin)->post(route('pizarra.store'), [
            ...$this->datosBaseVuelo(),
            'aeronave' => 'NAVAL 211',
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
            'es_evaluacion_manual' => true,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('vuelos', ['aeronave' => 'NAVAL 211', 'mision' => 'PS-3D']);
    }

    public function test_editar_una_evaluacion_manual_no_falla_aunque_la_aeronave_de_relleno_este_de_baja(): void
    {
        // Mismo caso que el ingreso manual, pero al EDITAR una cruz ya cargada desde
        // la matriz (doble clic): también debe omitir la regla operativa de
        // aeronave de baja, porque sigue siendo un registro histórico de matriz.
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = \App\Models\Alumno::create(['nombre' => 'Alumno Uno', 'activo' => true]);

        $vuelo = \App\Models\Vuelo::create([
            ...$this->datosBaseVuelo(),
            'aeronave' => 'NAVAL 211',
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
            'calificacion' => 'pendiente',
        ]);

        $this->marcarAeronaveDeBaja('NAVAL 211'); // se da de baja DESPUÉS de cargada la cruz

        $this->actingAs($admin)->put(route('pizarra.update', $vuelo->id), [
            ...$this->datosBaseVuelo(),
            'aeronave' => 'NAVAL 211',
            'mision' => 'PS-3D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
            'calificacion' => 'aprobado',
            'es_evaluacion_manual' => true,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('vuelos', ['id' => $vuelo->id, 'calificacion' => 'aprobado']);
    }
}
