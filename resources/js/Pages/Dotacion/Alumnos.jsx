import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Alumnos({ auth, alumnos }) {
    const isAdmin = auth.user.role === 'admin';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        nombre: '',
        activo: true,
        email: '',
    });

    const openCreateModal = () => {
        setEditingId(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (alumno) => {
        setEditingId(alumno.id);
        setData({
            nombre: alumno.nombre,
            activo: alumno.activo,
            email: alumno.email || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route('alumnos.update', editingId), {
                onSuccess: () => { reset(); setIsModalOpen(false); }
            });
        } else {
            post(route('alumnos.store'), {
                onSuccess: () => { reset(); setIsModalOpen(false); }
            });
        }
    };

    const toggleEstado = (alumno) => {
        router.put(route('alumnos.update', alumno.id), {
            nombre: alumno.nombre,
            activo: !alumno.activo,
        }, {
            preserveScroll: true
        });
    };

    const inputStyle = "mt-1.5 block w-full bg-gray-950 border border-gray-600 text-white placeholder-gray-500 rounded-md shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium";

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gestión de Alumnos" />

            <div className="py-8 bg-gray-950 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* ENCABEZADO */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Escuadrón de Alumnos</h1>
                            <p className="text-sm text-gray-400 mt-1">Alta y control de disponibilidad de alumnos pilotos</p>
                        </div>
                        {isAdmin && (
                            <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-md shadow-lg flex items-center justify-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                <span>Nuevo Alumno</span>
                            </button>
                        )}
                    </div>

                    {/* TABLA DE ALUMNOS */}
                    <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700 text-left">
                                <thead className="bg-gray-900/40">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Grado y Apellido</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email (NOTAM diario)</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Vuelos Registrados</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Vencimiento</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Estado Operativo</th>
                                        {isAdmin && <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/60 bg-gray-800/20">
                                    {alumnos.map((alumno) => (
                                        <tr key={alumno.id} className={`hover:bg-gray-700/40 transition-colors ${!alumno.activo && 'opacity-50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-200">
                                                {alumno.nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs">
                                                {alumno.email
                                                    ? <span className="text-gray-300">{alumno.email}</span>
                                                    : <span className="text-gray-600 italic">Sin cargar</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {/* CONTADOR DE VUELOS */}
                                                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
                                                    {alumno.vuelos_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {alumno.vencido ? (
                                                    <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border bg-red-500/10 text-red-400 border-red-500/30">
                                                        Vencido — {alumno.dias_sin_volar}d sin volar
                                                    </span>
                                                ) : alumno.dias_sin_volar !== null ? (
                                                    <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border bg-green-500/10 text-green-400 border-green-500/30">
                                                        Al día ({alumno.dias_sin_volar}d)
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border bg-gray-700/50 text-gray-400 border-gray-600">
                                                        Sin vuelos
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${alumno.activo ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-gray-700/50 text-gray-400 border-gray-600'}`}>
                                                    {alumno.activo ? 'Disponible' : 'Inactivo'}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-xs flex justify-end items-center space-x-2">
                                                    <button
                                                        onClick={() => toggleEstado(alumno)}
                                                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${alumno.activo ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30'}`}
                                                    >
                                                        {alumno.activo ? 'Desactivar' : 'Reactivar'}
                                                    </button>

                                                    <button onClick={() => openEditModal(alumno)} className="bg-gray-700/50 hover:bg-blue-600 text-gray-300 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all">
                                                        Editar
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {alumnos.length === 0 && (
                                        <tr><td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-sm text-center text-gray-500 italic">No hay alumnos registrados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MODAL DEL FORMULARIO */}
                    {isAdmin && isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">{editingId ? 'Corregir Nombre' : 'Alta de Alumno'}</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold focus:outline-none">&times;</button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Grado y Apellido del Alumno</label>
                                        <input type="text" placeholder="Ej: T2 Laymuns" value={data.nombre} onChange={e => setData('nombre', e.target.value)} className={inputStyle} required />
                                        {errors.nombre && <p className="text-red-400 text-xs mt-2 font-bold">{errors.nombre}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Email (opcional)</label>
                                        <input type="email" placeholder="alumno@correo.com" value={data.email} onChange={e => setData('email', e.target.value)} className={inputStyle} />
                                        <p className="text-[10px] text-gray-500 mt-1">Si se carga, el alumno recibe automáticamente el NOTAM diario por correo a las 06:00.</p>
                                        {errors.email && <p className="text-red-400 text-xs mt-2 font-bold">{errors.email}</p>}
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