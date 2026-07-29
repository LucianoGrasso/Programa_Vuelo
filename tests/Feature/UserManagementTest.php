<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_operador_no_puede_ver_usuarios(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->get(route('usuarios.index'))->assertForbidden();
    }

    public function test_operador_no_puede_crear_usuarios(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->post(route('usuarios.store'), [
            'name' => 'Nuevo Operador',
            'email' => 'nuevo@example.com',
            'password' => 'password123',
            'role' => 'operador',
        ])->assertForbidden();
    }

    public function test_admin_puede_ver_usuarios(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get(route('usuarios.index'))->assertOk();
    }

    public function test_admin_puede_crear_usuario(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('usuarios.store'), [
            'name' => 'Nuevo Operador',
            'email' => 'nuevo@example.com',
            'password' => 'password123',
            'role' => 'operador',
        ])->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'nuevo@example.com',
            'role' => 'operador',
        ]);
    }

    public function test_admin_puede_cambiar_el_rol_de_un_usuario(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $otro = User::factory()->create(['role' => 'operador']);

        $this->actingAs($admin)->put(route('usuarios.update', $otro), [
            'role' => 'admin',
        ])->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $otro->id,
            'role' => 'admin',
        ]);
    }

    public function test_no_se_puede_crear_usuario_con_rol_invalido(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('usuarios.store'), [
            'name' => 'Rol Invalido',
            'email' => 'rolinvalido@example.com',
            'password' => 'password123',
            'role' => 'superadmin',
        ])->assertSessionHasErrors('role');
    }
}
