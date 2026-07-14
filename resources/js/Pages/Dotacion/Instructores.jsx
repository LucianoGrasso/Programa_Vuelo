import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Instructores({ auth, instructores }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);

    const { data, setData, post, put, reset, processing } = useForm({
        nombre: '',
        nombre_combate: '',
        numero: '',
    });

    const openCreateModal = () => {
        setEditingInstructor(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (instructor) => {
        setEditingInstructor(instructor);
        setData({
            nombre: instructor.nombre,
            nombre_combate: instructor.nombre_combate || '',
            numero: instructor.numero || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingInstructor) {
            put(route('instructores.update', editingInstructor.id), {
                onSuccess: () => { setIsModalOpen(false); reset(); }
            });
        } else {
            post(route('instructores.store'), {
                onSuccess: () => { setIsModalOpen(false); reset(); }
            });
        }
    };

    const toggleActivo = (instructor) => {
        router.put(route('instructores.update', instructor.id), {
            ...instructor,
            activo: !instructor.activo
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nómina de Instructores" />

            <div className="py-8 bg-gray-950 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* CABECERA */}
                    <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Nómina de Instructores</h1>
                            <p className="text-sm text-gray-400 mt-1">Gestión de personal de instrucción y nombres de combate</p>
                        </div>
                        <button 
                            onClick={openCreateModal} 
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-md shadow-lg transition-all"
                        >
                            + Nuevo Instructor
                        </button>
                    </div>

                    {/* TABLA DE INSTRUCTORES */}
                    <div className="bg-gray-800/40 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700 text-left">
                                <thead className="bg-gray-900/60">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Grado y Apellido</th>
                                        <th className="px-6 py-4 text-xs font-bold text-blue-400 uppercase tracking-widest">Nombre de Combate</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">N° Matriz</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Estado</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50 bg-gray-800/20">
                                    {instructores.map((instructor) => (
                                        <tr key={instructor.id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                                                {instructor.nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-black tracking-widest text-blue-400 uppercase">
                                                {instructor.nombre_combate || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300 text-center">
                                                {instructor.numero || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button 
                                                    onClick={() => toggleActivo(instructor)}
                                                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${instructor.activo ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                                                >
                                                    {instructor.activo ? 'Operativo' : 'Inactivo'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button 
                                                    onClick={() => openEditModal(instructor)} 
                                                    className="text-gray-400 hover:text-blue-400 font-bold uppercase text-[11px] tracking-wider transition-colors"
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {instructores.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 italic">
                                                No hay instructores registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MODAL DE CREACIÓN / EDICIÓN */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                            <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                                        {editingInstructor ? 'Editar Instructor' : 'Alta de Instructor'}
                                    </h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">Grado y Apellido (Oficial)</label>
                                        <input 
                                            type="text" 
                                            value={data.nombre} 
                                            onChange={e => setData('nombre', e.target.value)} 
                                            placeholder="Ej: T1 Raby" 
                                            className="w-full bg-gray-950 border border-gray-600 text-white rounded px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                                            required 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-1.5">Nombre de Combate (Pizarra)</label>
                                        <input 
                                            type="text" 
                                            value={data.nombre_combate} 
                                            onChange={e => setData('nombre_combate', e.target.value)} 
                                            placeholder="Ej: CARANCHO" 
                                            className="w-full bg-gray-950 border border-blue-500/50 text-blue-100 uppercase tracking-wider font-bold rounded px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                                            required 
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">Este nombre reemplazará al grado y apellido en la Pizarra.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-green-400 mb-1.5">N° Identificador (Matriz Evaluaciones)</label>
                                        <input 
                                            type="number" 
                                            value={data.numero} 
                                            onChange={e => setData('numero', e.target.value)} 
                                            placeholder="Ej: 1" 
                                            className="w-full bg-gray-950 border border-green-500/30 text-white rounded px-3 py-2.5 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" 
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/60 mt-2">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors">Cancelar</button>
                                        <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase py-2 px-5 rounded-md shadow-lg transition-colors">
                                            Guardar Registro
                                        </button>
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