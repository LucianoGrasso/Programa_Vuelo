<?php

namespace App\Console\Commands;

use App\Exceptions\NotamNoDisponibleException;
use App\Mail\NotamDiario;
use App\Models\Alumno;
use App\Services\NotamScraper;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class EnviarNotamDiario extends Command
{
    protected $signature = 'notam:enviar';

    protected $description = 'Manda por correo el NOTAM del día (IFIS) a los alumnos activos con email cargado y recibe_notam activo';

    public function handle(NotamScraper $scraper): int
    {
        $designador = config('notam.designador');
        $urlIfis = config('notam.url') . '?designador=' . $designador;

        try {
            $notams = $scraper->obtenerNotams($designador);
        } catch (NotamNoDisponibleException $e) {
            // Sin NOTAM del día no se manda un correo vacío/engañoso: se avisa que
            // hay que consultar IFIS directo (ver App\Mail\NotamDiario).
            $this->warn("No se pudo obtener el NOTAM: {$e->getMessage()}");
            $notams = null;
        }

        // recibe_notam es independiente de tener el email cargado: un alumno puede
        // guardar su email para otro uso sin que eso implique recibir este correo.
        $destinatarios = Alumno::where('activo', true)
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->where('recibe_notam', true)
            ->get();

        if ($destinatarios->isEmpty()) {
            $this->info('No hay alumnos activos con email cargado: no se envía nada.');

            return self::SUCCESS;
        }

        $fecha = now()->toDateString();
        foreach ($destinatarios as $alumno) {
            Mail::to($alumno->email)->send(new NotamDiario($notams, $designador, $fecha, $urlIfis));
        }

        $this->info(sprintf(
            'NOTAM %s enviado a %d alumno(s) (%s).',
            $designador,
            $destinatarios->count(),
            $notams === null ? 'aviso de no disponible' : count($notams) . ' vigentes'
        ));

        return self::SUCCESS;
    }
}
