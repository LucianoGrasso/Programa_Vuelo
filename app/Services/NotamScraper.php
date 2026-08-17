<?php

namespace App\Services;

use App\Exceptions\NotamNoDisponibleException;
use Illuminate\Support\Facades\Http;

/**
 * Trae y parsea los NOTAM vigentes de un aeródromo desde IFIS (DGAC Chile).
 *
 * IFIS no tiene API pública: esta página (https://aipchile.dgac.gob.cl/notam)
 * devuelve HTML pensado para mostrarse, no datos estructurados. Este servicio
 * lo scrapea, así que es inherentemente frágil ante cambios de la DGAC en el
 * markup — por eso la salvaguarda en parsear(): si la página declara que hay
 * NOTAM pero no logramos extraer ninguno, es más probable que el parser se
 * haya roto que que la lista esté realmente vacía, y lo tratamos como falla.
 */
class NotamScraper
{
    /**
     * @return string[] Texto completo (formato ICAO original) de cada NOTAM vigente.
     *
     * @throws NotamNoDisponibleException si no se pudo obtener o parsear el NOTAM.
     */
    public function obtenerNotams(?string $designador = null): array
    {
        $designador = $designador ?? config('notam.designador');
        $url = config('notam.url');

        try {
            $response = Http::timeout(15)->get($url, ['designador' => $designador]);
        } catch (\Throwable $e) {
            throw new NotamNoDisponibleException(
                "No se pudo conectar a IFIS para el designador {$designador}: {$e->getMessage()}",
                previous: $e
            );
        }

        if (!$response->successful()) {
            throw new NotamNoDisponibleException("IFIS respondió con estado {$response->status()} para el designador {$designador}.");
        }

        return $this->parsear($response->body());
    }

    private function parsear(string $html): array
    {
        $cantidadDeclarada = $this->extraerCantidadDeclarada($html);

        $doc = new \DOMDocument();
        libxml_use_internal_errors(true);
        $doc->loadHTML('<?xml encoding="utf-8" ?>' . $html);
        libxml_clear_errors();

        $xpath = new \DOMXPath($doc);
        $nodos = $xpath->query(
            '//tr[contains(concat(" ", normalize-space(@class), " "), " notam_raw ")]' .
            '/td[contains(concat(" ", normalize-space(@class), " "), " codificacion ")]'
        );

        $notams = [];
        foreach ($nodos as $nodo) {
            $texto = $this->textoDeNodo($doc, $nodo);
            if ($texto !== '') {
                $notams[] = $texto;
            }
        }

        if ($cantidadDeclarada !== null && $cantidadDeclarada > 0 && count($notams) === 0) {
            throw new NotamNoDisponibleException(
                "IFIS declara {$cantidadDeclarada} NOTAM pero no se pudo extraer ninguno (¿cambió el formato de la página?)."
            );
        }

        return $notams;
    }

    /**
     * El badge "Notams (N)" de la página: sirve para distinguir "0 NOTAM vigentes"
     * (estado real, N=0) de "el parser dejó de reconocer los bloques" (N>0 pero no
     * se extrajo nada).
     */
    private function extraerCantidadDeclarada(string $html): ?int
    {
        if (preg_match('/Notams\s*\((\d+)\)/i', $html, $coincidencia)) {
            return (int) $coincidencia[1];
        }

        return null;
    }

    /**
     * Reconstruye el texto plano de un NOTAM a partir de su celda de codificación:
     * los <br> y cierres de <div> se convierten en saltos de línea (si no, el texto
     * queda todo pegado), se sacan el resto de las etiquetas y se decodifican
     * entidades HTML.
     */
    private function textoDeNodo(\DOMDocument $doc, \DOMNode $nodo): string
    {
        $innerHtml = '';
        foreach ($nodo->childNodes as $hijo) {
            $innerHtml .= $doc->saveHTML($hijo);
        }

        // Marca de salto "de verdad" (estructural, <br>/</div>), distinta de
        // cualquier salto de línea incidental que traiga el HTML de origen — si no,
        // el formato/indentación del HTML terminaría cortando líneas de más.
        $marcaDeSalto = "\u{E000}";
        $innerHtml = preg_replace('/<br\s*\/?>/i', $marcaDeSalto, $innerHtml);
        $innerHtml = preg_replace('/<\/div>/i', $marcaDeSalto, $innerHtml);
        $texto = strip_tags($innerHtml);
        $texto = html_entity_decode($texto, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        $lineas = array_filter(
            array_map(fn ($linea) => trim(preg_replace('/\s+/', ' ', $linea)), explode($marcaDeSalto, $texto)),
            fn ($linea) => $linea !== ''
        );

        return implode("\n", $lineas);
    }
}
