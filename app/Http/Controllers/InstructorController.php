<?php

namespace App\Http\Controllers;

use App\Models\Instructor;
use Illuminate\Http\Request;

class InstructorController extends Controller
{
    public function index()
    {
        // Añadimos withCount('vuelos') para que cuente las misiones asignadas
        $instructores = Instructor::withCount('vuelos')->orderBy('nombre')->get();
        
        return inertia('Dotacion/Instructores', [
            'instructores' => $instructores
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:instructores',
            'activo' => 'boolean'
        ]);

        Instructor::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Instructor $instructor)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:instructores,nombre,' . $instructor->id,
            'activo' => 'boolean'
        ]);

        $instructor->update($validated);
        return redirect()->back();
    }
}