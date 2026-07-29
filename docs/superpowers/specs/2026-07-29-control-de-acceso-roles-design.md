# Control de acceso por roles (admin / operador)

Fecha: 2026-07-29

## Contexto y problema

Hoy cualquier persona puede registrarse en `/register` y, con solo estar autenticada,
tiene acceso total: puede editar vuelos, novedades, calificaciones, y también
gestionar Instructores y Alumnos. No existe ningún concepto de rol ni de
autorización granular (`app/Policies` no existe).

Se necesita separar dos tipos de usuario:

- **admin**: acceso total (todo lo que existe hoy).
- **operador**: puede usar la Pizarra operativa, el Historial y las
  Evaluaciones (incluye cargar/editar vuelos, novedades diarias, y calificar),
  pero no puede gestionar Instructores, Alumnos ni Usuarios.

## Alcance

Incluye:
- Columna `role` en `users`.
- Middleware que protege rutas admin-only.
- Cierre del registro público; alta de usuarios pasa a ser una acción de admin.
- Pantalla nueva de gestión de usuarios (crear, listar, cambiar rol).
- Ocultar en el nav los enlaces a secciones admin-only cuando el usuario es operador.
- Tests de acceso para las rutas protegidas.

Fuera de alcance (no se hace ahora, se puede pedir después si hace falta):
- Borrado de usuarios.
- Reseteo de contraseña de otro usuario desde la UI de admin.
- Roles adicionales más allá de admin/operador.
- Políticas granulares por recurso (ej. "este operador solo ve sus propios vuelos").

## Diseño

### Datos

Migración: agrega `role` (`string`, default `'operador'`) a la tabla `users`.
En la misma migración, un `DB::table('users')->update(['role' => 'admin'])`
marca como admin a todas las cuentas que ya existan al momento de aplicarla
(hoy, uso interno de un solo desarrollador).

`App\Models\User`:
- agrega `role` a `$fillable`/atributo tipado.
- método `isAdmin(): bool` que devuelve `$this->role === 'admin'`.

No se valida el valor de `role` con un enum de base de datos (por portabilidad
entre sqlite/mysql); la restricción a `admin`/`operador` se hace a nivel de
`Request::validate()` en el controlador de usuarios.

### Backend — autorización

Nuevo middleware `App\Http\Middleware\EnsureUserIsAdmin`, registrado con el
alias `admin` en `bootstrap/app.php`. Si `!$request->user()->isAdmin()`,
aborta con 403.

`routes/web.php` se reorganiza en dos grupos dentro de `auth`:

- Grupo `auth` (admin + operador): rutas de Pizarra (`index`, `store`,
  `update`, `storeNovedades`), `historial`, `evaluaciones`. Sin cambios de
  comportamiento respecto a hoy.
- Grupo `auth` + `admin`: `instructores.*`, `alumnos.*`, y las rutas nuevas
  `usuarios.*`.

`routes/auth.php`: se eliminan las rutas `GET/POST /register` (grupo
`guest`). El resto (login, logout, forgot-password, reset-password, email
verification) queda igual.

### Backend — gestión de usuarios

Nuevo `App\Http\Controllers\UserController` (solo accesible vía rutas
`admin`):

- `index()`: `Inertia::render('Dotacion/Usuarios', ['usuarios' => User::orderBy('name')->get()])`.
- `store(Request $request)`: valida `name`, `email` (unique), `password`
  (`Rules\Password::defaults()`), `role` (`in:admin,operador`); crea el
  usuario con `Hash::make($request->password)`.
- `update(Request $request, User $user)`: valida `role` (`in:admin,operador`)
  y actualiza solo ese campo (cambio de rol; no permite editar nombre/email/password
  de otro usuario desde acá, YAGNI).

### Frontend

- `AuthenticatedLayout.jsx`: los enlaces de nav a Instructores, Alumnos y
  Usuarios se renderizan condicionados a `auth.user.role === 'admin'`. Esto es
  solo cosmético — la protección real está en el middleware del backend.
- Página nueva `resources/js/Pages/Dotacion/Usuarios.jsx`, siguiendo el mismo
  patrón visual/estructural que `Alumnos.jsx`/`Instructores.jsx` (tabla +
  modal de alta). El modal de alta incluye selector de rol (admin/operador).
  Igual que en Alumnos/Instructores, cada fila de la tabla abre el mismo
  modal en modo edición (click), donde el único campo editable es el rol.
- Pizarra, Historial y Evaluaciones: sin cambios de UI. Ambos roles operan
  igual ahí.

### Manejo de errores / casos borde

- Operador que navega a mano a `/instructores`, `/alumnos` o `/usuarios` →
  403 (respuesta de error estándar de Laravel/Inertia).
- Intento de crear un usuario con email duplicado → error de validación
  normal (ya existe ese patrón en `RegisteredUserController`).
- Un admin que se cambia su propio rol a `operador`: se permite (no hay
  protección especial de "no te quites el último admin" — está fuera de
  alcance; si se corta el acceso admin, se puede corregir directo en la base
  de datos, igual que hoy).

### Testing

Nuevos feature tests:
- Operador recibe 403 en `instructores.index`, `alumnos.index`, `usuarios.index`
  (y en los POST/PUT correspondientes).
- Admin puede acceder a esas rutas, crear un usuario y cambiarle el rol.
- Admin y operador pueden ambos acceder a `pizarra.index`, crear/editar un
  vuelo, y guardar novedades.
- Se elimina o adapta cualquier test existente que dependa de `/register`
  público (revisar `tests/Feature/Auth/RegistrationTest.php`).
