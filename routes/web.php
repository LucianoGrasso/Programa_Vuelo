<?php

use App\Http\Controllers\VueloController;
use Illuminate\Support\Facades\Route;

// Redirigir la raíz directamente a la pizarra.
// Si el usuario no ha iniciado sesión, Laravel lo enviará automáticamente al Login.
Route::get('/', function () {
    return redirect()->route('pizarra.index');
});

Route::middleware('auth')->group(function () {
    // Nuestras rutas de la pizarra
    Route::get('/pizarra', [VueloController::class, 'index'])->name('pizarra.index');
    Route::post('/pizarra', [VueloController::class, 'store'])->name('pizarra.store');
});

require __DIR__.'/auth.php';