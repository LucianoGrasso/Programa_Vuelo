<?php

use App\Http\Controllers\VueloController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\AlumnoController;
use App\Http\Controllers\UserController;

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

    Route::get('/usuarios', [UserController::class, 'index'])->name('usuarios.index');
    Route::post('/usuarios', [UserController::class, 'store'])->name('usuarios.store');
    Route::put('/usuarios/{user}', [UserController::class, 'update'])->name('usuarios.update');
});

require __DIR__.'/auth.php';
