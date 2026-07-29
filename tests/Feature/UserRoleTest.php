<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_usuario_nuevo_tiene_rol_operador_por_defecto(): void
    {
        $user = User::factory()->create();

        $this->assertSame('operador', $user->role);
        $this->assertFalse($user->isAdmin());
    }

    public function test_isadmin_devuelve_true_para_rol_admin(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->assertTrue($user->isAdmin());
    }
}
