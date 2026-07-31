<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

class BackupDatabase extends Command
{
    protected $signature = 'backup:database {--keep-days=30 : Días de retención antes de borrar backups viejos}';

    protected $description = 'Genera un dump comprimido de la base de datos y borra los backups más viejos que --keep-days';

    public function handle(): int
    {
        $connection = config('database.default');
        $config = config("database.connections.{$connection}");

        $backupDir = storage_path('app/backups');
        File::ensureDirectoryExists($backupDir);

        $timestamp = now()->format('Y-m-d_His');
        $filename = "{$config['database']}_{$timestamp}.sql.gz";
        $path = "{$backupDir}/{$filename}";

        // La contraseña va por variable de entorno (MYSQL_PWD), no como argumento
        // del comando: los argumentos de un proceso son visibles para cualquier
        // otro proceso del mismo host (ej. `ps aux`).
        $process = new Process([
            'mysqldump',
            '-h', $config['host'],
            '-P', (string) $config['port'],
            '-u', $config['username'],
            '--single-transaction',
            '--quick',
            $config['database'],
        ], null, ['MYSQL_PWD' => $config['password']]);
        $process->setTimeout(300);

        $gz = gzopen($path, 'wb9');
        if (! $gz) {
            $this->error("No se pudo crear el archivo de backup en {$path}");

            return self::FAILURE;
        }

        $process->run(function (string $type, string $buffer) use ($gz): void {
            if ($type === Process::OUT) {
                gzwrite($gz, $buffer);
            }
        });
        gzclose($gz);

        if (! $process->isSuccessful()) {
            File::delete($path);
            $this->error('mysqldump falló: '.$process->getErrorOutput());

            return self::FAILURE;
        }

        $sizeKb = File::size($path) / 1024;
        $this->info(sprintf('Backup creado: %s (%.1f KB)', $filename, $sizeKb));

        $keepDays = (int) $this->option('keep-days');
        $cutoff = now()->subDays($keepDays)->timestamp;
        $deleted = 0;

        foreach (File::files($backupDir) as $file) {
            if ($file->getMTime() < $cutoff) {
                File::delete($file->getPathname());
                $deleted++;
            }
        }

        if ($deleted > 0) {
            $this->info("Borrados {$deleted} backup(s) con más de {$keepDays} días.");
        }

        return self::SUCCESS;
    }
}
