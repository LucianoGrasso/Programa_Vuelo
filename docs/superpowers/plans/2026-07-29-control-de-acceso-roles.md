# Control de acceso por roles (admin / operador) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separar el acceso de la aplicación en dos roles — `admin` (acceso total) y `operador` (Pizarra, Historial y Evaluaciones) — cerrando el registro público y agregando una pantalla de gestión de usuarios solo para admin.

**Architecture:** Columna `role` en `users` + un middleware `admin` que protege las rutas de Instructores/Alumnos/Usuarios. El registro público desaparece; los usuarios se crean desde una pantalla nueva accesible solo para admin. El frontend oculta (no protege) los enlaces admin-only en el nav; la protección real vive en el backend.

**Tech Stack:** Laravel 13 (PHP 8.3+), Inertia.js + React, PHPUnit, Tailwind.

## Global Constraints

- Spec de referencia: `docs/superpowers/specs/2026-07-29-control-de-acceso-roles-design.md`.
- Roles válidos: exactamente `admin` y `operador` (string), validados con `in:admin,operador` — sin enum de base de datos.
- Todas las cuentas que ya existan al aplicar la migración quedan como `admin`.
- No se borran usuarios ni se resetea password de otro usuario desde la UI (fuera de alcance).
- El test suite de este entorno corre contra SQLite en memoria (no hay MySQL/Sail levantado en esta máquina). El `.env` de desarrollo con MySQL no se toca — solo `phpunit.xml`.
- No hay tooling de test para JavaScript en este proyecto (no Jest/Vitest). La verificación de los cambios de React es `npm run build` sin errores; no se escriben tests JS.
- Hay un test pre-existente y roto sin relación con esta feature: `tests/Feature/ExampleTest.php` (espera 200 en `/` y hoy devuelve 302). No está en el alcance de este plan — no lo arreglen, no debería empeorar con estos cambios.

---

### Task 0: Configurar SQLite para correr el test suite

**Files:**
- Modify: `phpunit.xml`

**Interfaces:**
- Produces: test suite ejecutable localmente vía `php artisan test`, contra SQLite en memoria, sin depender de MySQL/Docker.

- [ ] **Step 1: Editar `phpunit.xml`**

En el bloque `<php>` de `phpunit.xml`, reemplazar la línea `<env name="DB_DATABASE" value="testing"/>` agregando también `DB_CONNECTION`, para que quede así (mantené el resto de las líneas `<env>` intactas):

```xml
        <env name="DB_CONNECTION" value="sqlite"/>
        <env name="DB_DATABASE" value=":memory:"/>
```

- [ ] **Step 2: Confirmar que el suite corre**

Run: `php artisan test`

Expected: el comando ejecuta sin errores de conexión ("could not find driver" no debe aparecer). Vas a ver 2 fallos pre-existentes sin relación con esta tarea: `Tests\Feature\ExampleTest::test_the_application_returns_a_successful_response` (fuera de alcance, ver Global Constraints) y `Tests\Feature\Auth\RegistrationTest` (se corrige en la Task 3). Ambos son esperados en este punto.

- [ ] **Step 3: Commit**

```bash
git add phpunit.xml
git commit -m "test: usar sqlite en memoria para el test suite local"
```

---

### Task 1: Migración de rol + `User::isAdmin()`

**Files:**
- Create: `database/migrations/2026_07_29_150000_add_role_to_users_table.php`
- Modify: `app/Models/User.php`
- Test: `tests/Feature/UserRoleTest.php`

**Interfaces:**
- Produces: columna `users.role` (string, default `'operador'`); `User::isAdmin(): bool`.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/Feature/UserRoleTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_usuario_nuevo_tiene_rol_operador_por_defecto(): void
    {
        $user = User::factory()->create();

        $this->assertSame('operador', $user->role);
        $this->assertFalse($user->isAdmin());
    }

    public function test_isadmin_devuelve_true_para_rol_admin(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->assertTrue($user->isAdmin());
    }
}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `php artisan test --filter=UserRoleTest`
Expected: FAIL — la columna `role` no existe todavía (error de base de datos "no such column: role" o similar).

- [ ] **Step 3: Crear la migración**

Crear `database/migrations/2026_07_29_150000_add_role_to_users_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('operador')->after('password');
        });

        // Las cuentas ya existentes (uso interno hasta ahora) pasan a admin.
        DB::table('users')->update(['role' => 'admin']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
```

- [ ] **Step 4: Agregar `role` al modelo `User`**

En `app/Http/../app/Models/User.php`, el atributo `#[Fillable(...)]` está en la línea 13 y la clase termina en la línea 32. Agregar `'role'` al fillable y el método `isAdmin()`:

```php
#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `php artisan test --filter=UserRoleTest`
Expected: PASS (2/2).

- [ ] **Step 6: Commit**

```bash
git add database/migrations/2026_07_29_150000_add_role_to_users_table.php app/Models/User.php tests/Feature/UserRoleTest.php
git commit -m "feat: agregar rol admin/operador a users"
```

---

### Task 2: Middleware `admin` + proteger Instructores/Alumnos

**Files:**
- Create: `app/Http/Middleware/EnsureUserIsAdmin.php`
- Modify: `bootstrap/app.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/AccesoRolesTest.php`

**Interfaces:**
- Consumes: `User::isAdmin()` (Task 1).
- Produces: alias de middleware `'admin'` registrado y usable en cualquier grupo de rutas; grupo de rutas `auth`+`admin` en `routes/web.php` para las siguientes tareas.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/Feature/AccesoRolesTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\Alumno;
use App\Models\Instructor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccesoRolesTest extends TestCase
{
    use RefreshDatabase;

    public function test_operador_no_puede_ver_instructores(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->get(route('instructores.index'))->assertForbidden();
    }

    public function test_operador_no_puede_crear_instructor(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->post(route('instructores.store'), [
            'nombre' => 'T1 Prueba',
            'nombre_combate' => 'PRUEBA',
        ])->assertForbidden();
    }

    public function test_operador_no_puede_ver_alumnos(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->get(route('alumnos.index'))->assertForbidden();
    }

    public function test_operador_no_puede_crear_alumno(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->post(route('alumnos.store'), [
            'nombre' => 'T2 Prueba',
        ])->assertForbidden();
    }

    public function test_admin_puede_ver_y_crear_instructores(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get(route('instructores.index'))->assertOk();

        $this->actingAs($admin)->post(route('instructores.store'), [
            'nombre' => 'T1 Prueba',
            'nombre_combate' => 'PRUEBA',
        ])->assertRedirect();

        $this->assertDatabaseHas('instructores', ['nombre_combate' => 'PRUEBA']);
    }

    public function test_admin_puede_ver_y_crear_alumnos(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get(route('alumnos.index'))->assertOk();

        $this->actingAs($admin)->post(route('alumnos.store'), [
            'nombre' => 'T2 Prueba',
        ])->assertRedirect();

        $this->assertDatabaseHas('alumnos', ['nombre' => 'T2 Prueba']);
    }

    public function test_operador_puede_operar_la_pizarra(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);
        $instructor = Instructor::create(['nombre' => 'T1 Base', 'nombre_combate' => 'BASE']);
        $alumno = Alumno::create(['nombre' => 'T2 Base']);

        $this->actingAs($operador)->get(route('pizarra.index'))->assertOk();
        $this->actingAs($operador)->get(route('pizarra.historial'))->assertOk();
        $this->actingAs($operador)->get(route('pizarra.evaluaciones'))->assertOk();

        $this->actingAs($operador)->post(route('pizarra.store'), [
            'fecha' => now()->toDateString(),
            'aeronave' => 'NAVAL 211',
            'etd' => '09:00',
            'eta' => '10:00',
            'mision' => 'PS-1D',
            'instructor_id' => $instructor->id,
            'alumno_id' => $alumno->id,
        ])->assertRedirect();

        $this->actingAs($operador)->post(route('pizarra.novedades'), [
            'fecha' => now()->toDateString(),
        ])->assertRedirect();
    }

    public function test_admin_tambien_puede_operar_la_pizarra(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get(route('pizarra.index'))->assertOk();
        $this->actingAs($admin)->get(route('pizarra.historial'))->assertOk();
        $this->actingAs($admin)->get(route('pizarra.evaluaciones'))->assertOk();
    }
}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `php artisan test --filter=AccesoRolesTest`
Expected: FAIL en los tests de `instructores`/`alumnos` (hoy cualquier usuario autenticado puede entrar — no da 403).

- [ ] **Step 3: Crear el middleware**

Crear `app/Http/Middleware/EnsureUserIsAdmin.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        return $next($request);
    }
}
```

- [ ] **Step 4: Registrar el alias `admin` en `bootstrap/app.php`**

`bootstrap/app.php` completo debe quedar así (el bloque `withMiddleware` está en las líneas 14-21 del archivo actual):

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
```

- [ ] **Step 5: Reorganizar `routes/web.php` en dos grupos**

Reemplazar todo el contenido de `routes/web.php` por:

```php
<?php

use App\Http\Controllers\VueloController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\AlumnoController;

// Redirigir la raíz directamente a la pizarra.
// Si el usuario no ha iniciado sesión, Laravel lo enviará automáticamente al Login.
Route::get('/', function () {
    return redirect()->route('pizarra.index');
});

Route::middleware('auth')->group(function () {
    // Rutas operativas: accesibles para admin y operador.
    Route::get('/pizarra', [VueloController::class, 'index'])->name('pizarra.index');
    Route::put('/pizarra/{vuelo}', [VueloController::class, 'update'])->name('pizarra.update');
    Route::post('/pizarra', [VueloController::class, 'store'])->name('pizarra.store');
    Route::post('/pizarra/novedades', [VueloController::class, 'storeNovedades'])->name('pizarra.novedades');

    Route::get('/historial', [VueloController::class, 'historial'])->name('pizarra.historial');

    Route::get('/evaluaciones', [VueloController::class, 'evaluaciones'])->name('pizarra.evaluaciones');
});

Route::middleware(['auth', 'admin'])->group(function () {
    // Rutas de gestión: solo admin.
    Route::get('/instructores', [InstructorController::class, 'index'])->name('instructores.index');
    Route::post('/instructores', [InstructorController::class, 'store'])->name('instructores.store');
    Route::put('/instructores/{instructor}', [InstructorController::class, 'update'])->name('instructores.update');

    Route::get('/alumnos', [AlumnoController::class, 'index'])->name('alumnos.index');
    Route::post('/alumnos', [AlumnoController::class, 'store'])->name('alumnos.store');
    Route::put('/alumnos/{alumno}', [AlumnoController::class, 'update'])->name('alumnos.update');
});

require __DIR__.'/auth.php';
```

(Las rutas de `usuarios.*` se agregan a este segundo grupo en la Task 4.)

- [ ] **Step 6: Correr el test y verificar que pasa**

Run: `php artisan test --filter=AccesoRolesTest`
Expected: PASS (8/8).

- [ ] **Step 7: Correr el resto del suite para chequear que nada se rompió**

Run: `php artisan test`
Expected: mismos 2 fallos pre-existentes de la Task 0 (`ExampleTest`, `RegistrationTest`) y nada más. `InstructorControllerTest`/`AlumnoControllerTest` no existen todavía, no hay que crearlos en esta task.

- [ ] **Step 8: Commit**

```bash
git add app/Http/Middleware/EnsureUserIsAdmin.php bootstrap/app.php routes/web.php tests/Feature/AccesoRolesTest.php
git commit -m "feat: proteger instructores y alumnos con middleware admin"
```

---

### Task 3: Cerrar el registro público

**Files:**
- Modify: `routes/auth.php`
- Delete: `app/Http/Controllers/Auth/RegisteredUserController.php`
- Delete: `resources/js/Pages/Auth/Register.jsx`
- Modify: `resources/js/Pages/Auth/Login.jsx`
- Modify: `tests/Feature/Auth/RegistrationTest.php`

**Interfaces:**
- Produces: `/register` (GET y POST) deja de existir (404).

- [ ] **Step 1: Reescribir el test (falla primero)**

Reemplazar todo el contenido de `tests/Feature/Auth/RegistrationTest.php`:

```php
<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class RegistrationTest extends TestCase
{
    public function test_las_rutas_de_registro_publico_ya_no_existen(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register', [])->assertNotFound();
    }
}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `php artisan test --filter=RegistrationTest`
Expected: FAIL — `/register` todavía existe y devuelve 200/302, no 404.

- [ ] **Step 3: Quitar las rutas de registro de `routes/auth.php`**

En `routes/auth.php`, dentro del grupo `Route::middleware('guest')->group(...)` (líneas 14-36 del archivo actual), borrar estas líneas (14-18):

```php
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

```

y borrar el `use App\Http\Controllers\Auth\RegisteredUserController;` (línea 10) ya que deja de usarse.

- [ ] **Step 4: Borrar el controlador y la página de registro**

```bash
git rm app/Http/Controllers/Auth/RegisteredUserController.php resources/js/Pages/Auth/Register.jsx
```

- [ ] **Step 5: Quitar el link "Crear nuevo usuario" de `Login.jsx`**

En `resources/js/Pages/Auth/Login.jsx`, el bloque de acciones (líneas 89-104 del archivo actual) es:

```jsx
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/60">
                    <Link
                        href={route('register')}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/50 hover:decoration-blue-400 transition-colors"
                    >
                        Crear nuevo usuario
                    </Link>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-md transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Iniciar Sesión
                    </button>
                </div>
```

Reemplazarlo por (se quita el `Link` a `register` y se cambia `justify-between` por `justify-end` ya que ahora solo queda el botón):

```jsx
                <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-700/60">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-md transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Iniciar Sesión
                    </button>
                </div>
```

También quitar el import de `Link` de la primera línea de imports si ya no se usa en el resto del archivo (`import { Head, Link, useForm } from '@inertiajs/react';` → `import { Head, useForm } from '@inertiajs/react';`); revisar el resto del archivo antes de quitarlo por si se usa en otro lado.

- [ ] **Step 6: Correr el test y verificar que pasa**

Run: `php artisan test --filter=RegistrationTest`
Expected: PASS (1/1).

- [ ] **Step 7: Compilar el frontend para confirmar que no quedaron referencias rotas**

Run: `npm run build`
Expected: build exitoso, sin errores de módulos faltantes ni de Ziggy sobre la ruta `register`.

- [ ] **Step 8: Commit**

```bash
git add routes/auth.php resources/js/Pages/Auth/Login.jsx tests/Feature/Auth/RegistrationTest.php
git commit -m "feat: cerrar el registro público de usuarios"
```

---

### Task 4: Backend de gestión de usuarios (solo admin)

**Files:**
- Create: `app/Http/Controllers/UserController.php`
- Modify: `routes/web.php`
- Test: `tests/Feature/UserManagementTest.php`

**Interfaces:**
- Consumes: `User::isAdmin()` (Task 1), middleware `admin` (Task 2).
- Produces: rutas `usuarios.index` (GET), `usuarios.store` (POST), `usuarios.update` (PUT `/usuarios/{user}`), todas admin-only. `usuarios.index` renderiza `Inertia::render('Dotacion/Usuarios', ['usuarios' => ...])` — la página React se crea en la Task 5.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/Feature/UserManagementTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_operador_no_puede_ver_usuarios(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->get(route('usuarios.index'))->assertForbidden();
    }

    public function test_operador_no_puede_crear_usuarios(): void
    {
        $operador = User::factory()->create(['role' => 'operador']);

        $this->actingAs($operador)->post(route('usuarios.store'), [
            'name' => 'Nuevo Operador',
            'email' => 'nuevo@example.com',
            'password' => 'password123',
            'role' => 'operador',
        ])->assertForbidden();
    }

    public function test_admin_puede_ver_usuarios(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get(route('usuarios.index'))->assertOk();
    }

    public function test_admin_puede_crear_usuario(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('usuarios.store'), [
            'name' => 'Nuevo Operador',
            'email' => 'nuevo@example.com',
            'password' => 'password123',
            'role' => 'operador',
        ])->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'nuevo@example.com',
            'role' => 'operador',
        ]);
    }

    public function test_admin_puede_cambiar_el_rol_de_un_usuario(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $otro = User::factory()->create(['role' => 'operador']);

        $this->actingAs($admin)->put(route('usuarios.update', $otro), [
            'role' => 'admin',
        ])->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $otro->id,
            'role' => 'admin',
        ]);
    }

    public function test_no_se_puede_crear_usuario_con_rol_invalido(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post(route('usuarios.store'), [
            'name' => 'Rol Invalido',
            'email' => 'rolinvalido@example.com',
            'password' => 'password123',
            'role' => 'superadmin',
        ])->assertSessionHasErrors('role');
    }
}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `php artisan test --filter=UserManagementTest`
Expected: FAIL — las rutas `usuarios.*` no existen todavía (error "Route [usuarios.index] not defined" o similar).

- [ ] **Step 3: Crear `UserController`**

Crear `app/Http/Controllers/UserController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    public function index()
    {
        $usuarios = User::orderBy('name')->get(['id', 'name', 'email', 'role']);

        return inertia('Dotacion/Usuarios', [
            'usuarios' => $usuarios
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'password' => ['required', Rules\Password::defaults()],
            'role' => 'required|string|in:admin,operador',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->back();
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|string|in:admin,operador',
        ]);

        $user->update($validated);

        return redirect()->back();
    }
}
```

- [ ] **Step 4: Agregar las rutas `usuarios.*` al grupo admin**

En `routes/web.php`, agregar el import y las rutas dentro del grupo `Route::middleware(['auth', 'admin'])->group(...)` creado en la Task 2:

```php
use App\Http\Controllers\UserController;
```

(junto a los otros `use` del principio del archivo), y dentro del grupo admin, después del bloque de `alumnos`:

```php
    Route::get('/usuarios', [UserController::class, 'index'])->name('usuarios.index');
    Route::post('/usuarios', [UserController::class, 'store'])->name('usuarios.store');
    Route::put('/usuarios/{user}', [UserController::class, 'update'])->name('usuarios.update');
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `php artisan test --filter=UserManagementTest`
Expected: PASS (6/6).

- [ ] **Step 6: Correr todo el suite**

Run: `php artisan test`
Expected: mismo único fallo pre-existente fuera de alcance (`ExampleTest`); `RegistrationTest` y todo lo demás en verde.

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/UserController.php routes/web.php tests/Feature/UserManagementTest.php
git commit -m "feat: agregar gestión de usuarios (backend) para admin"
```

---

### Task 5: Frontend de gestión de usuarios + nav condicionado por rol

**Files:**
- Create: `resources/js/Pages/Dotacion/Usuarios.jsx`
- Modify: `resources/js/Layouts/AuthenticatedLayout.jsx`

**Interfaces:**
- Consumes: prop Inertia `usuarios` (array de `{id, name, email, role}`) desde `UserController@index` (Task 4); rutas con nombre `usuarios.index`, `usuarios.store`, `usuarios.update` (Ziggy `route()`); prop `user` (con `user.role`) que `AuthenticatedLayout` ya recibe hoy de cada página vía `auth.user`.

- [ ] **Step 1: Crear la página `Usuarios.jsx`**

Crear `resources/js/Pages/Dotacion/Usuarios.jsx`, siguiendo el mismo patrón visual que `resources/js/Pages/Dotacion/Alumnos.jsx`:

```jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Usuarios({ auth, usuarios }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'operador',
    });

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (usuario) => {
        setEditingUser(usuario);
        setData({
            name: usuario.name,
            email: usuario.email,
            password: '',
            role: usuario.role,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            // Único campo editable en modo edición: el rol. Se manda solo
            // ese dato (no el estado completo del form) vía router.put.
            router.put(route('usuarios.update', editingUser.id), { role: data.role }, {
                preserveScroll: true,
                onSuccess: () => { reset(); setIsModalOpen(false); }
            });
        } else {
            post(route('usuarios.store'), {
                onSuccess: () => { reset(); setIsModalOpen(false); }
            });
        }
    };

    const inputStyle = "mt-1.5 block w-full bg-gray-950 border border-gray-600 text-white placeholder-gray-500 rounded-md shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium";

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gestión de Usuarios" />

            <div className="py-8 bg-gray-950 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Usuarios</h1>
                            <p className="text-sm text-gray-400 mt-1">Alta de cuentas y control de roles de acceso</p>
                        </div>
                        <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-md shadow-lg flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            <span>Nuevo Usuario</span>
                        </button>
                    </div>

                    <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700 text-left">
                                <thead className="bg-gray-900/40">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Rol</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/60 bg-gray-800/20">
                                    {usuarios.map((usuario) => (
                                        <tr key={usuario.id} className="hover:bg-gray-700/40 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-200">
                                                {usuario.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {usuario.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${usuario.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-gray-700/50 text-gray-300 border-gray-600'}`}>
                                                    {usuario.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                                                <button onClick={() => openEditModal(usuario)} className="bg-gray-700/50 hover:bg-blue-600 text-gray-300 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all">
                                                    Cambiar Rol
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {usuarios.length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-8 text-sm text-center text-gray-500 italic">No hay usuarios registrados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">{editingUser ? `Cambiar Rol — ${editingUser.name}` : 'Alta de Usuario'}</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold focus:outline-none">&times;</button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    {!editingUser && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Nombre</label>
                                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputStyle} required />
                                                {errors.name && <p className="text-red-400 text-xs mt-2 font-bold">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Email</label>
                                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputStyle} required />
                                                {errors.email && <p className="text-red-400 text-xs mt-2 font-bold">{errors.email}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Contraseña Inicial</label>
                                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className={inputStyle} required />
                                                {errors.password && <p className="text-red-400 text-xs mt-2 font-bold">{errors.password}</p>}
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Rol</label>
                                        <select value={data.role} onChange={e => setData('role', e.target.value)} className={inputStyle}>
                                            <option value="operador">Operador</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {errors.role && <p className="text-red-400 text-xs mt-2 font-bold">{errors.role}</p>}
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/60 mt-6">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white">Cancelar</button>
                                        <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase py-2 px-5 rounded-md shadow-lg">Guardar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

- [ ] **Step 2: Condicionar el nav por rol en `AuthenticatedLayout.jsx`**

En `resources/js/Layouts/AuthenticatedLayout.jsx`, agregar una constante `isAdmin` junto a las demás detecciones de ruta activa (después de la línea 14, junto a `isEvaluacionesActive`):

```jsx
    const isUsuariosActive = currentPath.startsWith('/usuarios'); // NUEVO
    const isAdmin = user.role === 'admin';
```

En la sección **PESTAÑAS (ESCRITORIO)** (líneas 43-48 del archivo actual), envolver los links de Instructores y Alumnos, y agregar el de Usuarios:

```jsx
                                {isAdmin && (
                                    <>
                                        <Link href={route('instructores.index')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-xs font-bold tracking-widest uppercase transition-colors duration-150 ${isInstructoresActive ? 'border-blue-400 text-blue-400 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>
                                            Instructores
                                        </Link>
                                        <Link href={route('alumnos.index')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-xs font-bold tracking-widest uppercase transition-colors duration-150 ${isAlumnosActive ? 'border-blue-400 text-blue-400 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>
                                            Alumnos
                                        </Link>
                                        <Link href={route('usuarios.index')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-xs font-bold tracking-widest uppercase transition-colors duration-150 ${isUsuariosActive ? 'border-blue-400 text-blue-400 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>
                                            Usuarios
                                        </Link>
                                    </>
                                )}
```

(esto reemplaza los dos `<Link>` de Instructores/Alumnos que estaban sueltos ahí).

En la sección **MENÚ DESPLEGABLE (MÓVIL)** (líneas 100-105 del archivo actual), aplicar el mismo criterio:

```jsx
                        {isAdmin && (
                            <>
                                <Link href={route('instructores.index')} className={`block w-full ps-3 pr-4 py-2 border-l-4 text-left text-sm font-bold uppercase tracking-wider ${isInstructoresActive ? 'border-blue-400 bg-blue-500/10 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}>
                                    Instructores
                                </Link>
                                <Link href={route('alumnos.index')} className={`block w-full ps-3 pr-4 py-2 border-l-4 text-left text-sm font-bold uppercase tracking-wider ${isAlumnosActive ? 'border-blue-400 bg-blue-500/10 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}>
                                    Alumnos
                                </Link>
                                <Link href={route('usuarios.index')} className={`block w-full ps-3 pr-4 py-2 border-l-4 text-left text-sm font-bold uppercase tracking-wider ${isUsuariosActive ? 'border-blue-400 bg-blue-500/10 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}>
                                    Usuarios
                                </Link>
                            </>
                        )}
```

- [ ] **Step 3: Compilar el frontend**

Run: `npm run build`
Expected: build exitoso, sin errores.

- [ ] **Step 4: Verificación manual (opcional pero recomendada)**

Si querés confirmarlo visualmente: `npm run dev` + `php artisan serve`, iniciar sesión con un usuario `admin` (cualquier cuenta existente, ya migrada a admin en la Task 1) y verificar que aparecen Instructores/Alumnos/Usuarios en el nav y que `/usuarios` permite crear un usuario con rol `operador`; luego iniciar sesión con ese usuario operador y confirmar que el nav solo muestra Pizarra/Evaluaciones/Historial y que entrar a `/instructores` a mano da error 403.

- [ ] **Step 5: Correr el test suite completo una última vez**

Run: `php artisan test`
Expected: todo en verde salvo el único fallo pre-existente fuera de alcance (`ExampleTest`, ver Global Constraints).

- [ ] **Step 6: Commit**

```bash
git add resources/js/Pages/Dotacion/Usuarios.jsx resources/js/Layouts/AuthenticatedLayout.jsx
git commit -m "feat: agregar pantalla de gestión de usuarios y ocultar nav admin-only"
```
