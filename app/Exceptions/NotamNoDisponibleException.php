<?php

namespace App\Exceptions;

/**
 * No se pudo obtener/parsear el NOTAM desde IFIS (caída de red, error HTTP, o el
 * HTML de la página cambió y el parser ya no reconoce los bloques). El comando
 * notam:enviar la usa para decidir mandar el correo de aviso en vez del listado.
 */
class NotamNoDisponibleException extends \RuntimeException
{
}
