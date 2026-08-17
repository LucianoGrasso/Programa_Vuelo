<?php

return [
    // Código OACI del aeródromo a consultar en IFIS (Escuela de Aviación Naval: Viña del Mar).
    'designador' => env('NOTAM_DESIGNADOR', 'SCVM'),

    // Endpoint público de NOTAM de IFIS (DGAC Chile). No requiere login ni API key.
    'url' => env('NOTAM_URL', 'https://aipchile.dgac.gob.cl/notam'),
];
