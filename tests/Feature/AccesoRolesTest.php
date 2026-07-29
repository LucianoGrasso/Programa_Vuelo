<?php

namespace Tests\Feature;

use App\Models\Alumno;
use App\Models\Instructor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccesoRolesTest extends TestCase
{
    use RefreshDatabase;

    public function test_operador_no_puede_ver_instructores(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->get(route('instructores.index'))->assertForbidden();
    }

    public function test_operador_no_puede_crear_instructor(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->post(route('instructores.store'), [
            'nombre' => 'T1 Prueba',
            'nombre_combate' => 'PRUEBA',
        ])->assertForbidden();
    }

    public function test_operador_no_puede_ver_alumnos(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->get(route('alumnos.index'))->assertForbidden();
    }

    public function test_operador_no_puede_crear_alumno(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->post(route('alumnos.store'), [
            'nombre' => 'T2 Prueba',
        ])->assertForbidden();
    }

    public function test_operador_no_puede_actualizar_instructor(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);

        $this->actingAs($operador)->put(route('instructores.update', $instructor), [
            'nombre' => 'T1 Editado',
            'nombre_combate' => 'EDITADO',
        ])->assertForbidden();
    }

    public function test_operador_no_puede_actualizar_alumno(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        $this->actingAs($operador)->put(route('alumnos.update', $alumno), [
            'nombre' => 'T2 Editado',
        ])->assertForbidden();
    }

    public function test_guest_es_redirigido_al_login_en_ruta_admin(): void
    {
        $this->get(route('usuarios.index'))->assertRedirect(route('login'));
    }

    public function test_admin_puede_ver_y_crear_instructores(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get(route('instructores.index'))->assertOk();

        $this->actingAs($admin)->post(route('instructores.store'), [
            'nombre' => 'T1 Prueba',
            'nombre_combate' => 'PRUEBA',
        ])->assertRedirect();

        $this->assertDatabaseHas('instructores', ['nombre_combate' => 'PRUEBA']);
    }

    public function test_admin_puede_ver_y_crear_alumnos(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get(route('alumnos.index'))->assertOk();

        $this->actingAs($admin)->post(route('alumnos.store'), [
            'nombre' => 'T2 Prueba',
        ])->assertRedirect();

        $this->assertDatabaseHas('alumnos', ['nombre' => 'T2 Prueba']);
    }

    public function test_operador_puede_operar_la_pizarra(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        $this->actingAs($operador)->get(route('pizarra.index'))->assertOk();
        $this->actingAs($operador)->get(route('pizarra.historial'))->assertOk();
        $this->actingAs($operador)->get(route('pizarra.evaluaciones'))->assertOk();

        $this->actingAs($operador)->post(route('pizarra.store'), [
            'fecha' => now()->toDateString(),
            'aeronave' => 'NAVAL 211',
            'etd' => '09:00',
            'eta' => '10:00',
            'mision' => 'PS-1D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ])->assertRedirect();

        $this->actingAs($operador)->post(route('pizarra.novedades'), [
            'fecha' => now()->toDateString(),
        ])->assertRedirect();
    }

    public function test_admin_tambien_puede_operar_la_pizarra(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get(route('pizarra.index'))->assertOk();
        $this->actingAs($admin)->get(route('pizarra.historial'))->assertOk();
        $this->actingAs($admin)->get(route('pizarra.evaluaciones'))->assertOk();
    }
}
