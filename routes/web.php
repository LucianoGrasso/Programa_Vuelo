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
    // Nuestras rutas de la pizarra
    Route::get('/pizarra', [VueloController::class, 'index'])->name('pizarra.index');
    Route::put('/pizarra/{vuelo}', [VueloController::class, 'update'])->name('pizarra.update');
    Route::post('/pizarra', [VueloController::class, 'store'])->name('pizarra.store');
    Route::post('/pizarra/novedades', [VueloController::class, 'storeNovedades'])->name('pizarra.novedades');


    Route::get('/historial', [VueloController::class, 'historial'])->name('pizarra.historial');


    Route::get('/instructores', [InstructorController::class, 'index'])->name('instructores.index');
    Route::post('/instructores', [InstructorController::class, 'store'])->name('instructores.store');
    Route::put('/instructores/{instructor}', [InstructorController::class, 'update'])->name('instructores.update');

    Route::get('/alumnos', [AlumnoController::class, 'index'])->name('alumnos.index');
    Route::post('/alumnos', [AlumnoController::class, 'store'])->name('alumnos.store');
    Route::put('/alumnos/{alumno}', [AlumnoController::class, 'update'])->name('alumnos.update');

});

require __DIR__.'/auth.php';