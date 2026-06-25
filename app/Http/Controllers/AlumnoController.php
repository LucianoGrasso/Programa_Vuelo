<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use Illuminate\Http\Request;

class AlumnoController extends Controller
{
    public function index()
    {
        // Añadimos withCount('vuelos') para los alumnos
        $alumnos = Alumno::withCount('vuelos')->orderBy('nombre')->get();
        
        return inertia('Dotacion/Alumnos', [
            'alumnos' => $alumnos
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:alumnos',
            'activo' => 'boolean'
        ]);

        Alumno::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Alumno $alumno)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:alumnos,nombre,' . $alumno->id,
            'activo' => 'boolean'
        ]);

        $alumno->update($validated);
        return redirect()->back();
    }
}