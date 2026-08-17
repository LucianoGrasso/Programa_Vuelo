#!/bin/bash
# Corrido por cron todos los días a las 06:00. Ver `crontab -l`.
# Manda el NOTAM del día (IFIS, aeródromo NOTAM_DESIGNADOR del .env) por correo
# a los alumnos activos con email cargado. Requiere que los contenedores de
# Docker estén levantados (`./vendor/bin/sail up -d`); si no lo están, esta
# corrida se salta sin romper nada, queda registrada en el log de abajo.

set -euo pipefail

cd /home/luciano/Proyecto_Programa_Vuelo

if ! /usr/bin/docker compose ps --status running --services 2>/dev/null | grep -q '^laravel.test$'; then
    echo "$(date -Iseconds) - contenedor laravel.test no está corriendo, se salta el envío de NOTAM" >> storage/logs/notam-cron.log
    exit 0
fi

/usr/bin/docker compose exec -T -u sail laravel.test php artisan notam:enviar >> storage/logs/notam-cron.log 2>&1
