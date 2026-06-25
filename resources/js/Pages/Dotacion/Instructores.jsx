import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// IMPORTANTE: Añadimos 'router' a la importación de Inertia
import { Head, useForm, router } from '@inertiajs/react';

export default function Instructores({ auth, instructores }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        nombre: '',
        activo: true,
    });

    const openCreateModal = () => {
        setEditingId(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (instructor) => {
        setEditingId(instructor.id);
        setData({
            nombre: instructor.nombre,
            activo: instructor.activo,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route('instructores.update', editingId), {
                onSuccess: () => { reset(); setIsModalOpen(false); }
            });
        } else {
            post(route('instructores.store'), {
                onSuccess: () => { reset(); setIsModalOpen(false); }
            });
        }
    };

    // SOLUCIÓN: Usamos router.put directamente pasándole los datos correctos
    const toggleEstado = (instructor) => {
        router.put(route('instructores.update', instructor.id), {
            nombre: instructor.nombre,
            activo: !instructor.activo, // Invertimos el estado actual
        }, {
            preserveScroll: true // Evita que la pantalla salte hacia arriba al recargar
        });
    };

    const inputStyle = "mt-1.5 block w-full bg-gray-950 border border-gray-600 text-white placeholder-gray-500 rounded-md shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium";

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gestión de Instructores" />

            <div className="py-8 bg-gray-950 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Nómina de Instructores</h1>
                            <p className="text-sm text-gray-400 mt-1">Administración de personal y estado operativo</p>
                        </div>
                        <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-md shadow-lg flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            <span>Nuevo Instructor</span>
                        </button>
                    </div>

                    {/* TABLA DE INSTRUCTORES */}
                    <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700 text-left">
                                <thead className="bg-gray-900/40">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Grado y Apellido</th>
                                        {/* NUEVA COLUMNA DE ESTADÍSTICA */}
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Vuelos Registrados</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Estado Operativo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/60 bg-gray-800/20">
                                    {instructores.map((instructor) => (
                                        <tr key={instructor.id} className={`hover:bg-gray-700/40 transition-colors ${!instructor.activo && 'opacity-50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-200">
                                                {instructor.nombre}
                                            </td>
                                            
                                            {/* AQUÍ IMPRIMIMOS EL CONTADOR MÁGICO DE LARAVEL */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
                                                    {instructor.vuelos_count}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${instructor.activo ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-gray-700/50 text-gray-400 border-gray-600'}`}>
                                                    {instructor.activo ? 'Disponible' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs flex justify-end items-center space-x-2">
                                                <button 
                                                    onClick={() => toggleEstado(instructor)}
                                                    className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${instructor.activo ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30'}`}
                                                >
                                                    {instructor.activo ? 'Desactivar' : 'Reactivar'}
                                                </button>
                                                
                                                <button onClick={() => openEditModal(instructor)} className="bg-gray-700/50 hover:bg-blue-600 text-gray-300 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all">
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {instructores.length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-8 text-sm text-center text-gray-500 italic">No hay instructores registrados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MODAL DE FORMULARIO */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">{editingId ? 'Corregir Nombre' : 'Alta de Instructor'}</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold focus:outline-none">&times;</button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Grado y Apellido</label>
                                        <input type="text" placeholder="Ej: T1 Raby" value={data.nombre} onChange={e => setData('nombre', e.target.value)} className={inputStyle} required />
                                        {errors.nombre && <p className="text-red-400 text-xs mt-2 font-bold">{errors.nombre}</p>}
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/60 mt-6">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white">Cancelar</button>
                                        <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase py-2 px-5 rounded-md shadow-lg">Guardar Registro</button>
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