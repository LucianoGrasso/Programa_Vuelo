import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Pizarra({ auth, vuelos }) {
    // Estado para controlar el modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Separamos "nota" (calificación) de "observaciones" (novedades/fallas)
    const { data, setData, post, processing, reset } = useForm({
        fecha: new Date().toISOString().split('T')[0],
        aeronave: '',
        etd: '',
        eta: '',
        mision: '',
        dotacion: '',
        nota: '', 
        observaciones: '' 
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('pizarra.store'), {
            onSuccess: () => {
                // Limpiamos todos los campos incluyendo el nuevo
                reset('aeronave', 'etd', 'eta', 'mision', 'dotacion', 'nota', 'observaciones');
                setIsModalOpen(false);
            }
        });
    };

    const inputStyle = "mt-1.5 block w-full bg-gray-950 border border-gray-600 text-white placeholder-gray-500 rounded-md shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium";

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pizarra de Vuelo" />

            <div className="py-8 bg-gray-950 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* ENCABEZADO */}
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Consola de Operaciones</h1>
                            <p className="text-sm text-gray-400 mt-1">Control de vuelos de Escuela de Aviación Naval y del Escuadrón VT-1</p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-md transition-all shadow-lg shadow-blue-600/20 flex items-center space-x-2 active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <span>Nueva Misión</span>
                            </button>

                            <div className="bg-gray-800 px-4 py-1.5 border border-gray-700 rounded-md hidden sm:block">
                                <span className="text-[10px] text-gray-400 block uppercase font-semibold tracking-widest">Fecha Sistema</span>
                                <span className="text-sm text-blue-400 font-mono font-bold">{new Date().toLocaleDateString('es-CL')}</span>
                            </div>
                        </div>
                    </div>

                    {/* TABLA DE LA PIZARRA */}
                    <div className="bg-gray-800 shadow-2xl sm:rounded-xl overflow-hidden border border-gray-700">
                        <div className="px-6 py-4 bg-gray-700/40 border-b border-gray-700 flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Línea de Vuelo Activa</span>
                            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono px-2 py-0.5 rounded">
                                {vuelos.length} misiones
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700 text-center">
                                <thead className="bg-gray-900/60">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Aeronave</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">E.T.D</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">E.T.A</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Misión</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Dotación</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-green-400">Nota Vuelo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/60 bg-gray-800/40">
                                    {vuelos.map((vuelo) => (
                                        <tr key={vuelo.id} className="hover:bg-gray-700/40 transition-colors even:bg-gray-800/20">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">{vuelo.fecha}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-400 tracking-wide">
                                                <span className="bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                                                    {vuelo.aeronave}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-gray-200">{vuelo.etd.substring(0, 5)} hrs</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-gray-200">{vuelo.eta.substring(0, 5)} hrs</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">{vuelo.mision}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-left pl-8">{vuelo.dotacion}</td>
                                            
                                            {/* Columna Nota de Vuelo */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">
                                                {vuelo.nota ? vuelo.nota : '-'}
                                            </td>

                                            {/* Columna Observaciones */}
                                            <td className="px-6 py-4 text-sm font-bold text-red-400 max-w-xs truncate">
                                                {vuelo.observaciones ? (
                                                    <span className="bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                                        {vuelo.observaciones}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500 font-normal italic">Sin novedades</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {vuelos.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-8 text-sm text-gray-400 italic">
                                                No hay misiones programadas para hoy.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* MODAL DE REGISTRO */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity animate-fade-in">
                            <div className="bg-gray-800 border border-gray-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden transform transition-all animate-scale-up">
                                
                                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Registrar Nueva Misión de Vuelo</h3>
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-400 hover:text-white text-xl font-bold transition-colors focus:outline-none"
                                    >
                                        &times;
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Fecha</label>
                                            <input type="date" value={data.fecha} onChange={e => setData('fecha', e.target.value)} className={inputStyle} required style={{ colorScheme: 'dark' }} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Aeronave</label>
                                            <input type="text" placeholder="Ej: N-215" value={data.aeronave} onChange={e => setData('aeronave', e.target.value)} className={inputStyle} required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">E.T.D (Salida)</label>
                                            <input type="time" value={data.etd} onChange={e => setData('etd', e.target.value)} className={inputStyle} required style={{ colorScheme: 'dark' }} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">E.T.A (Llegada)</label>
                                            <input type="time" value={data.eta} onChange={e => setData('eta', e.target.value)} className={inputStyle} required style={{ colorScheme: 'dark' }} />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Misión</label>
                                            <input type="text" placeholder="Ej: PS-3D" value={data.mision} onChange={e => setData('mision', e.target.value)} className={inputStyle} required />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Dotación</label>
                                            <input type="text" placeholder="Instructor / Alumno" value={data.dotacion} onChange={e => setData('dotacion', e.target.value)} className={inputStyle} required />
                                        </div>
                                        
                                        {/* NUEVOS CAMPOS SEPARADOS */}
                                        <div className="sm:col-span-1">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-green-400">Nota de Vuelo</label>
                                            <input type="text" placeholder="Ej: 6.5" value={data.nota} onChange={e => setData('nota', e.target.value)} className={`${inputStyle} border-green-500/30 focus:border-green-500 focus:ring-green-500/20`} />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Observaciones</label>
                                            <input type="text" placeholder="Fallas, novedades operativas o material" value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} className={inputStyle} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700/60 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-md transition-all shadow-lg shadow-blue-600/10 active:scale-95"
                                        >
                                            Anotar en Pizarra
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