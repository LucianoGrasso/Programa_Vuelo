<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Correo diario de NOTAM para los alumnos, enviado por el comando notam:enviar.
 *
 * $notams tiene tres estados posibles, cada uno con su propio mensaje en la vista:
 * - null: no se pudo obtener el NOTAM de IFIS (falla de red o el parser se rompió)
 *   -> se avisa que hay que consultar directo en IFIS.
 * - []: se consultó bien y no hay NOTAM vigentes -> mensaje de "sin novedades".
 * - [...]: lista de NOTAM vigentes en texto (formato ICAO original).
 */
class NotamDiario extends Mailable
{
    use Queueable, SerializesModels;

    /** @param string[]|null $notams */
    public function __construct(
        public readonly ?array $notams,
        public readonly string $designador,
        public readonly string $fecha,
        public readonly string $urlIfis,
    ) {
    }

    public function envelope(): Envelope
    {
        $asunto = match (true) {
            $this->notams === null => "NOTAM {$this->designador} — no disponible hoy",
            count($this->notams) === 0 => "NOTAM {$this->designador} — sin novedades ({$this->fecha})",
            default => "NOTAM {$this->designador} — {$this->fecha} (" . count($this->notams) . ' vigentes)',
        };

        return new Envelope(subject: $asunto);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.notam-diario');
    }
}
