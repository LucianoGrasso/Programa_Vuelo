<?php

namespace Tests\Feature;

use App\Models\Instructor;
use App\Models\NovedadDiaria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\Fluent\AssertableJson;
use Tests\TestCase;

class HerenciaNovedadesDiariasTest extends TestCase
{
    use RefreshDatabase;

    public function test_borrar_una_observacion_no_resucita_una_nota_vieja_al_dia_siguiente(): void
    {
        // Regresión: antes, un día en blanco se "saltaba" al heredar, así que
        // una nota vieja (ya borrada) volvía a aparecer al día siguiente.
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);

        // Hace 2 días: nota real cargada.
        NovedadDiaria::create([
            'fecha' => now()->subDays(2)->toDateString(),
            'obs_instructores' => [['id' => $instructor->id, 'observacion' => 'Nota vieja']],
        ]);

        // Ayer: alguien la borró (guardó el array en blanco).
        NovedadDiaria::create([
            'fecha' => now()->subDay()->toDateString(),
            'obs_instructores' => [['id' => $instructor->id, 'observacion' => '']],
        ]);

        // Hoy: todavía no se cargó nada.
        $this->actingAs($admin)->get(route('pizarra.index'))
            ->assertInertia(fn (AssertableJson $page) => $page
                ->where('ultimoEstadoInstructores.0.observacion', '')
                ->etc()
            );
    }

    public function test_sin_ningun_dia_en_blanco_hereda_la_nota_real_normalmente(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);

        NovedadDiaria::create([
            'fecha' => now()->subDay()->toDateString(),
            'obs_instructores' => [['id' => $instructor->id, 'observacion' => 'Nota vigente']],
        ]);

        $this->actingAs($admin)->get(route('pizarra.index'))
            ->assertInertia(fn (AssertableJson $page) => $page
                ->where('ultimoEstadoInstructores.0.observacion', 'Nota vigente')
                ->etc()
            );
    }
}
