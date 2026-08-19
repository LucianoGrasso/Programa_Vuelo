<?php

namespace Tests\Feature;

use App\Mail\NotamDiario;
use App\Models\Alumno;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EnviarNotamDiarioCommandTest extends TestCase
{
    use RefreshDatabase;

    private function fixture(string $nombre): string
    {
        return file_get_contents(base_path("tests/Fixtures/{$nombre}"));
    }

    public function test_envia_el_notam_solo_a_los_alumnos_activos_con_email(): void
    {
        Http::fake(['aipchile.dgac.gob.cl/*' => Http::response($this->fixture('ifis_notam_scvm.html'), 200)]);
        Mail::fake();

        $conEmail = Alumno::create(['nombre' => 'Con Email', 'activo' => true, 'email' => 'con.email@escuela.cl']);
        $sinEmail = Alumno::create(['nombre' => 'Sin Email', 'activo' => true, 'email' => null]);
        $inactivoConEmail = Alumno::create(['nombre' => 'Inactivo', 'activo' => false, 'email' => 'inactivo@escuela.cl']);

        Artisan::call('notam:enviar');

        Mail::assertSent(NotamDiario::class, function ($mail) use ($conEmail) {
            return $mail->hasTo($conEmail->email) && count($mail->notams) === 2;
        });
        Mail::assertNotSent(NotamDiario::class, fn ($mail) => $mail->hasTo($sinEmail->email ?? ''));
        Mail::assertNotSent(NotamDiario::class, fn ($mail) => $mail->hasTo($inactivoConEmail->email));
        Mail::assertSentCount(1);
    }

    public function test_no_envia_a_un_alumno_que_desactivo_el_notam_aunque_tenga_email(): void
    {
        // recibe_notam es independiente de tener el email cargado: permite guardar
        // el email para otro uso sin que eso implique recibir el correo diario.
        Http::fake(['aipchile.dgac.gob.cl/*' => Http::response($this->fixture('ifis_notam_scvm.html'), 200)]);
        Mail::fake();

        $activo = Alumno::create(['nombre' => 'Recibe', 'activo' => true, 'email' => 'recibe@escuela.cl', 'recibe_notam' => true]);
        $desactivado = Alumno::create(['nombre' => 'No Recibe', 'activo' => true, 'email' => 'norecibe@escuela.cl', 'recibe_notam' => false]);

        Artisan::call('notam:enviar');

        Mail::assertSent(NotamDiario::class, fn ($mail) => $mail->hasTo($activo->email));
        Mail::assertNotSent(NotamDiario::class, fn ($mail) => $mail->hasTo($desactivado->email));
        Mail::assertSentCount(1);
    }

    public function test_si_falla_ifis_manda_el_correo_de_aviso_sin_notams(): void
    {
        Http::fake(['aipchile.dgac.gob.cl/*' => Http::response($this->fixture('ifis_notam_scvm_roto.html'), 200)]);
        Mail::fake();

        $alumno = Alumno::create(['nombre' => 'Alumno Uno', 'activo' => true, 'email' => 'alumno@escuela.cl']);

        Artisan::call('notam:enviar');

        Mail::assertSent(NotamDiario::class, fn ($mail) => $mail->hasTo($alumno->email) && $mail->notams === null);
    }

    public function test_notams_vacio_pero_exitoso_manda_correo_de_sin_novedades(): void
    {
        Http::fake(['aipchile.dgac.gob.cl/*' => Http::response($this->fixture('ifis_notam_scvm_vacio.html'), 200)]);
        Mail::fake();

        $alumno = Alumno::create(['nombre' => 'Alumno Uno', 'activo' => true, 'email' => 'alumno@escuela.cl']);

        Artisan::call('notam:enviar');

        Mail::assertSent(NotamDiario::class, fn ($mail) => $mail->hasTo($alumno->email) && $mail->notams === []);
    }

    public function test_no_manda_nada_si_no_hay_destinatarios(): void
    {
        Http::fake(['aipchile.dgac.gob.cl/*' => Http::response($this->fixture('ifis_notam_scvm.html'), 200)]);
        Mail::fake();

        Artisan::call('notam:enviar');

        Mail::assertNothingSent();
    }
}
