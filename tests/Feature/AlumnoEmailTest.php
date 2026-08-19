<?php

namespace Tests\Feature;

use App\Models\Alumno;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlumnoEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_se_puede_cargar_el_email_al_crear_un_alumno(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('alumnos.store'), [
            'nombre' => 'T2 Prueba',
            'activo' => true,
            'email' => 'tprueba@escuela.cl',
        ])->assertRedirect();

        $this->assertDatabaseHas('alumnos', ['nombre' => 'T2 Prueba', 'email' => 'tprueba@escuela.cl']);
    }

    public function test_el_email_es_opcional(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('alumnos.store'), [
            'nombre' => 'T2 Sin Correo',
            'activo' => true,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('alumnos', ['nombre' => 'T2 Sin Correo', 'email' => null]);
    }

    public function test_rechaza_un_email_con_formato_invalido(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('alumnos.store'), [
            'nombre' => 'T2 Correo Malo',
            'activo' => true,
            'email' => 'no-es-un-email',
        ])->assertSessionHasErrors('email');

        $this->assertDatabaseMissing('alumnos', ['nombre' => 'T2 Correo Malo']);
    }

    public function test_se_puede_actualizar_el_email_de_un_alumno_existente(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $alumno = Alumno::create(['nombre' => 'T2 Existente', 'activo' => true]);

        $this->actingAs($admin)->put(route('alumnos.update', $alumno->id), [
            'nombre' => 'T2 Existente',
            'activo' => true,
            'email' => 'nuevo@escuela.cl',
        ])->assertRedirect();

        $this->assertDatabaseHas('alumnos', ['id' => $alumno->id, 'email' => 'nuevo@escuela.cl']);
    }

    public function test_recibe_notam_es_true_por_defecto_al_cargar_el_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('alumnos.store'), [
            'nombre' => 'T2 Prueba',
            'activo' => true,
            'email' => 'tprueba@escuela.cl',
        ])->assertRedirect();

        $this->assertDatabaseHas('alumnos', ['nombre' => 'T2 Prueba', 'recibe_notam' => true]);
    }

    public function test_se_puede_desactivar_el_notam_sin_borrar_el_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $alumno = Alumno::create(['nombre' => 'T2 Existente', 'activo' => true, 'email' => 'existente@escuela.cl']);

        $this->actingAs($admin)->put(route('alumnos.update', $alumno->id), [
            'nombre' => 'T2 Existente',
            'activo' => true,
            'email' => 'existente@escuela.cl',
            'recibe_notam' => false,
        ])->assertRedirect();

        $this->assertDatabaseHas('alumnos', ['id' => $alumno->id, 'email' => 'existente@escuela.cl', 'recibe_notam' => false]);
    }
}
