import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Historial({ auth, vuelos }) {
    const [busqueda, setBusqueda] = useState('');

    // FILTRO INTELIGENTE: Busca coincidencias ignorando si hay campos nulos
    const vuelosFiltrados = vuelos.filter(vuelo => {
        const termino = busqueda.toLowerCase();
        const instructorStr = vuelo.instructor?.nombre?.toLowerCase() || '';
        const alumnoStr = vuelo.alumno?.nombre?.toLowerCase() || '';
        const misionStr = vuelo.mision?.toLowerCase() || '';
        const aeronaveStr = vuelo.aeronave?.toLowerCase() || '';
        const fechaStr = vuelo.fecha || '';

        return instructorStr.includes(termino) ||
               alumnoStr.includes(termino) ||
               misionStr.includes(termino) ||
               aeronaveStr.includes(termino) ||
               fechaStr.includes(termino);
    });

    const renderMarcaProgreso = (estado) => {
        switch (estado) {
            case 'en_vuelo':
                return (
                    <div className="flex justify-center items-center">
                        <svg className="w-5 h-5 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 14l5 5L20 8" />
                        </svg>
                    </div>
                );
            case 'arribado':
                return (
                    <div className="flex justify-center items-center relative">
                        <svg className="w-5 h-5 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 14l5 5L20 8" />
                            <path d="M4 5l16 16" />
                        </svg>
                    </div>
                );
            case 'cancelado':
                return <span className="text-sm font-black text-orange-500 tracking-wider">Cx</span>;
            default:
                return <span className="text-gray-600 font-bold">-</span>;
        }
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return '';
        const [year, month, day] = fechaString.split('-');
        return `${day}-${month}-${year}`; // Formato DD-MM-YYYY
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Historial de Vuelos" />

            <div className="py-8 bg-gray-950 min-h-screen">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* ENCABEZADO Y BUSCADOR */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Registro Histórico</h1>
                            <p className="text-sm text-gray-400 mt-1">Base de datos general de operaciones de vuelo</p>
                        </div>
                        <div className="w-full md:w-1/3 relative">
                            <input 
                                type="text" 
                                placeholder="Buscar por piloto, fecha, aeronave o código..." 
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-md shadow-sm px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* TABLA DE HISTORIAL */}
                    <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700 flex flex-col">
                        <div className="px-4 py-3 bg-gray-700/60 border-b border-gray-600 flex justify-between items-center">
                            <span className="text-sm font-bold uppercase tracking-widest text-white">Misiones Registradas</span>
                            <span className="text-[10px] bg-blue-600/20 text-blue-400 font-mono px-2 py-1 rounded border border-blue-500/30">
                                {vuelosFiltrados.length} Resultados
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto flex-grow max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <table className="min-w-full divide-y divide-gray-700 text-center relative">
                                <thead className="bg-gray-900/90 sticky top-0 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="px-3 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[40px]">Ctrl</th>
                                        <th className="px-3 py-4 text-[10px] font-bold text-blue-400 uppercase tracking-wider text-left">Fecha</th>
                                        <th className="px-3 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aeronave</th>
                                        <th className="px-3 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">E.T.D</th>
                                        <th className="px-3 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">E.T.A</th>
                                        <th className="px-3 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Código</th>
                                        <th className="px-3 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dotación (Inst / Alum)</th>
                                        <th className="px-3 py-4 text-[10px] font-bold text-green-400 uppercase tracking-wider">Zona</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/60 bg-gray-800/20">
                                    {vuelosFiltrados.map((vuelo) => (
                                        <tr key={vuelo.id} className="hover:bg-gray-700/40 transition-colors even:bg-gray-800/40">
                                            <td className="px-3 py-3 whitespace-nowrap bg-gray-900/30 border-r border-gray-700/40">
                                                {renderMarcaProgreso(vuelo.estado_progreso)}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-xs font-mono font-bold text-blue-300 text-left">
                                                {formatearFecha(vuelo.fecha)}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-xs font-bold text-blue-400">{vuelo.aeronave}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-xs font-mono text-gray-200">{vuelo.etd.substring(0, 5)}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-xs font-mono text-gray-200">{vuelo.eta.substring(0, 5)}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-300 font-medium">{vuelo.mision}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-300">
                                                <span className="font-semibold text-gray-200">{vuelo.instructor?.nombre || 'S/I'}</span> / <span className="text-gray-400">{vuelo.alumno?.nombre || 'S/A'}</span>
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-xs font-bold text-green-400">{vuelo.nota || '-'}</td>
                                        </tr>
                                    ))}
                                    {vuelosFiltrados.length === 0 && (
                                        <tr><td colSpan="8" className="px-6 py-12 text-sm text-gray-500 italic">No se encontraron misiones con esos parámetros.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}