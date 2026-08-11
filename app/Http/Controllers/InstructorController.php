<?php

namespace App\Http\Controllers;

use App\Models\Instructor;
use Illuminate\Http\Request;

class InstructorController extends Controller
{
    public function index()
    {
        // Añadimos withCount('vuelos') para que cuente las misiones asignadas.
        // Orden por antigüedad (número de escalafón), no alfabético: el número 1
        // va arriba; los que no tienen número asignado quedan al final.
        $instructores = Instructor::withCount('vuelos')->orderByRaw('numero IS NULL, numero ASC')->get();
        
        return inertia('Dotacion/Instructores', [
            'instructores' => $instructores
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'nombre_combate' => 'required|string|max:255', // Ahora es requerido
            'numero' => 'nullable|integer',
        ]);

        Instructor::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Instructor $instructor)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'nombre_combate' => 'required|string|max:255',
            'numero' => 'nullable|integer',
            'activo' => 'boolean'
        ]);

        $instructor->update($validated);

        return redirect()->back();
    }
}