<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>NOTAM {{ $designador }}</title>
</head>
<body style="font-family: -apple-system, Arial, sans-serif; background:#f4f4f5; margin:0; padding:24px;">
    <div style="max-width:640px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; border:1px solid #e5e5e5;">
        <div style="background:#0f172a; color:#fff; padding:16px 24px;">
            <strong style="font-size:14px; letter-spacing:0.05em; text-transform:uppercase;">NOTAM {{ $designador }}</strong>
            <div style="font-size:12px; color:#94a3b8; margin-top:2px;">{{ $fecha }}</div>
        </div>

        <div style="padding:24px;">
            @if ($notams === null)
                <p style="color:#b91c1c; font-weight:bold; margin-top:0;">
                    No pudimos obtener automáticamente el NOTAM de {{ $designador }} hoy.
                </p>
                <p>
                    Consultalo directo en IFIS:
                    <a href="{{ $urlIfis }}">{{ $urlIfis }}</a>
                </p>
            @elseif (count($notams) === 0)
                <p style="margin-top:0;">No hay NOTAM vigentes para {{ $designador }} en este momento.</p>
            @else
                <p style="margin-top:0; color:#475569;">{{ count($notams) }} NOTAM vigentes para {{ $designador }}:</p>
                @foreach ($notams as $notam)
                    <pre style="white-space:pre-wrap; font-family: ui-monospace, monospace; font-size:12.5px; background:#0f172a; color:#e2e8f0; padding:12px 14px; border-radius:6px; margin:0 0 12px 0;">{{ $notam }}</pre>
                @endforeach
                <p style="font-size:12px; color:#94a3b8;">
                    Fuente: <a href="{{ $urlIfis }}">{{ $urlIfis }}</a>
                </p>
            @endif
        </div>

        <div style="padding:12px 24px; background:#f8fafc; border-top:1px solid #e5e5e5; font-size:11px; color:#94a3b8;">
            Correo automático — Escuela de Aviación Naval.
        </div>
    </div>
</body>
</html>
