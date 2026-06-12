<?php

namespace App\Http\Controllers;

use App\Models\Vuelo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VueloController extends Controller
{
    public function index()
    {
        // Traemos los vuelos ordenados por fecha y luego por hora de salida
        $vuelos = Vuelo::orderBy('fecha', 'desc')->orderBy('etd', 'asc')->get();

        return Inertia::render('Pizarra/Index', [
            'vuelos' => $vuelos
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'aeronave' => 'required|string|max:50',
            'etd' => 'required',
            'eta' => 'required',
            'mision' => 'required|string|max:100',
            'dotacion' => 'required|string|max:255',
            'nota' => 'nullable|string|max:100',
            'observaciones' => 'nullable|string|max:255',
        ]);

        Vuelo::create($validated);

        // Inertia recarga la página automáticamente por detrás y trae los datos actualizados
        return redirect()->back();
    }
}