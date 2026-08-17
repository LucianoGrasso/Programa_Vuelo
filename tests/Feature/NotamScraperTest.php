<?php

namespace Tests\Feature;

use App\Exceptions\NotamNoDisponibleException;
use App\Services\NotamScraper;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class NotamScraperTest extends TestCase
{
    private function fixture(string $nombre): string
    {
        return file_get_contents(base_path("tests/Fixtures/{$nombre}"));
    }

    public function test_obtiene_y_parsea_los_notams_del_fixture(): void
    {
        Http::fake(['aipchile.dgac.gob.cl/*' => Http::response($this->fixture('ifis_notam_scvm.html'), 200)]);

        $notams = (new NotamScraper())->obtenerNotams('SCVM');

        $this->assertCount(2, $notams);
        $this->assertStringContainsString('W2523/26 NOTAMN', $notams[0]);
        $this->assertStringContainsString('RPAS FLT WILL TAKE PLACE AT CON CON SECT,', $notams[0]);
        $this->assertStringContainsString('B0877/26 NOTAMR B0857/26', $notams[1]);
        $this->assertStringContainsString('ILS IVDM RWY05 U/S', $notams[1]);
    }

    public function test_le_pide_a_ifis_el_designador_correcto(): void
    {
        Http::fake(['aipchile.dgac.gob.cl/*' => Http::response($this->fixture('ifis_notam_scvm_vacio.html'), 200)]);

        (new NotamScraper())->obtenerNotams('SCVM');

        Http::assertSent(fn ($request) => $request->url() === 'https://aipchile.dgac.gob.cl/notam?designador=SCVM');
    }

    public function test_devuelve_lista_vacia_cuando_genuinamente_no_hay_notams_vigentes(): void
    {
        Http::fake(['aipchile.dgac.gob.cl/*' => Http::response($this->fixture('ifis_notam_scvm_vacio.html'), 200)]);

        $notams = (new NotamScraper())->obtenerNotams('SCVM');

        $this->assertSame([], $notams);
    }

    public function test_lanza_excepcion_si_la_pagina_declara_notams_pero_no_se_pudo_parsear_ninguno(): void
    {
        // Simula que la DGAC cambió el HTML: el badge "Notams (15)" sigue estando,
        // pero ya no reconocemos los bloques -> hay que tratarlo como falla, no
        // como "0 NOTAM vigentes" (sería mentirle a los alumnos).
        Http::fake(['aipchile.dgac.gob.cl/*' => Http::response($this->fixture('ifis_notam_scvm_roto.html'), 200)]);

        $this->expectException(NotamNoDisponibleException::class);

        (new NotamScraper())->obtenerNotams('SCVM');
    }

    public function test_lanza_excepcion_si_ifis_responde_con_error_http(): void
    {
        Http::fake(['aipchile.dgac.gob.cl/*' => Http::response('Internal Server Error', 500)]);

        $this->expectException(NotamNoDisponibleException::class);

        (new NotamScraper())->obtenerNotams('SCVM');
    }

    public function test_lanza_excepcion_si_falla_la_conexion(): void
    {
        Http::fake(function () {
            throw new ConnectionException('No se pudo conectar');
        });

        $this->expectException(NotamNoDisponibleException::class);

        (new NotamScraper())->obtenerNotams('SCVM');
    }
}
