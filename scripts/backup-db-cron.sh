#!/bin/bash
# Corrido por cron todos los días. Ver `crontab -l`.
# Dumpea la base a storage/app/backups/ (gitignored) y borra backups
# de más de 30 días. Requiere que los contenedores de Docker estén
# levantados (`./vendor/bin/sail up -d`); si no lo están, esta corrida
# se salta sin romper nada, queda registrada en el log de abajo.

set -euo pipefail

cd /home/luciano/Proyecto_Programa_Vuelo

if ! /usr/bin/docker compose ps --status running --services 2>/dev/null | grep -q '^mysql$'; then
    echo "$(date -Iseconds) - contenedor mysql no está corriendo, se salta el backup" >> storage/logs/backup-cron.log
    exit 0
fi

/usr/bin/docker compose exec -T -u sail laravel.test php artisan backup:database >> storage/logs/backup-cron.log 2>&1
