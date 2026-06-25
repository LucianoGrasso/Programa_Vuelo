import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

const LISTA_AERONAVES = ['NAVAL 211', 'NAVAL 212', 'NAVAL 213', 'NAVAL 215', 'NAVAL 216', 'NAVAL 217', 'NAVAL 219'];

export default function Pizarra({ auth, vuelos, instructores, alumnos, fechaHoy, fechaAyer, novedadHoy, novedadAyer, ultimoEstadoAeronaves }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNovedadesModalOpen, setIsNovedadesModalOpen] = useState(false);
    const [editingVuelo, setEditingVuelo] = useState(null);
    const [showFuturos, setShowFuturos] = useState(false);

    const initAeronaves = (guardadasHoy, historico) => {
        if (guardadasHoy && Array.isArray(guardadasHoy) && guardadasHoy.length > 0) return guardadasHoy;
        if (historico && Array.isArray(historico) && historico.length > 0) return historico;
        return LISTA_AERONAVES.map(nombre => ({ nombre, estado: 'disponible', detalle: '' }));
    };

    const formVuelo = useForm({
        fecha: fechaHoy,
        aeronave: '', // Guardará el nombre del avión seleccionado
        etd: '',
        eta: '',
        mision: '',
        instructor_id: '',
        alumno_id: '',
        nota: '',
        estado_progreso: 'programado'
    });

    const formNovedades = useForm({
        fecha: fechaHoy,
        obs_instructores: novedadHoy?.obs_instructores || '',
        obs_alumnos: novedadHoy?.obs_alumnos || '',
        aeronaves: initAeronaves(novedadHoy?.aeronaves, ultimoEstadoAeronaves),
        piloto_servicio: novedadHoy?.piloto_servicio || '',
    });

    useEffect(() => {
        if (novedadHoy) {
            formNovedades.setData({
                fecha: fechaHoy,
                obs_instructores: novedadHoy.obs_instructores || '',
                obs_alumnos: novedadHoy.obs_alumnos || '',
                aeronaves: initAeronaves(novedadHoy.aeronaves, ultimoEstadoAeronaves),
                piloto_servicio: novedadHoy.piloto_servicio || '',
            });
        }
    }, [novedadHoy]);

    const vuelosHoy = vuelos.filter(v => v.fecha === fechaHoy);
    const vuelosAyer = vuelos.filter(v => v.fecha === fechaAyer);
    const vuelosFuturos = vuelos.filter(v => v.fecha > fechaHoy);

    // FILTRADO DE SEGURIDAD OPERATIVA: Obtenemos solo los aviones disponibles hoy
    const listaAeronavesHoy = initAeronaves(novedadHoy?.aeronaves, ultimoEstadoAeronaves);
    const aeronavesDisponibles = listaAeronavesHoy.filter(aero => aero.estado === 'disponible');

    // Resguardo para consistencia del modo edición:
    // Si estamos editando un vuelo antiguo cuyo avión pasó a estar "de baja" posteriormente,
    // lo inyectamos temporalmente a la lista para que el selector no aparezca en blanco.
    if (editingVuelo && !aeronavesDisponibles.some(a => a.nombre === editingVuelo.aeronave)) {
        aeronavesDisponibles.unshift({ nombre: editingVuelo.aeronave, estado: 'baja' });
    }

    const formatearFechaTablero = (fechaString) => {
        if (!fechaString) return '';
        const [year, month, day] = fechaString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long' });
    };

    const openCreateModal = () => {
        setEditingVuelo(null);
        formVuelo.reset('aeronave', 'etd', 'eta', 'mision', 'instructor_id', 'alumno_id', 'nota', 'estado_progreso');
        formVuelo.setData('fecha', fechaHoy);
        setIsModalOpen(true);
    };

    const openEditModal = (vuelo) => {
        setEditingVuelo(vuelo);
        formVuelo.setData({
            fecha: vuelo.fecha,
            aeronave: vuelo.aeronave,
            etd: vuelo.etd.substring(0, 5),
            eta: vuelo.eta.substring(0, 5),
            mision: vuelo.mision,
            instructor_id: vuelo.instructor_id,
            alumno_id: vuelo.alumno_id,
            nota: vuelo.nota || '',
            estado_progreso: vuelo.estado_progreso || 'programado'
        });
        setIsModalOpen(true);
    };

    const handleVueloSubmit = (e) => {
        e.preventDefault();
        if (editingVuelo) {
            formVuelo.put(route('pizarra.update', editingVuelo.id), {
                onSuccess: () => { formVuelo.reset(); setEditingVuelo(null); setIsModalOpen(false); }
            });
        } else {
            formVuelo.post(route('pizarra.store'), {
                onSuccess: () => { 
                    formVuelo.reset('aeronave', 'etd', 'eta', 'mision', 'instructor_id', 'alumno_id', 'nota', 'estado_progreso'); 
                    setIsModalOpen(false); 
                }
            });
        }
    };

    const handleNovedadesSubmit = (e) => {
        e.preventDefault();
        formNovedades.post(route('pizarra.novedades'), {
            onSuccess: () => setIsNovedadesModalOpen(false)
        });
    };

    const updateAeronave = (index, campo, valor) => {
        const nuevas = [...formNovedades.data.aeronaves];
        nuevas[index][campo] = valor;
        formNovedades.setData('aeronaves', nuevas);
    };

    const inputStyle = "mt-1.5 block w-full bg-gray-950 border border-gray-600 text-white placeholder-gray-500 rounded-md shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium";
    const textareaStyle = "mt-1.5 block w-full bg-gray-950 border border-gray-600 text-gray-200 placeholder-gray-600 rounded-md shadow-sm px-3 py-2 text-xs focus:outline-none focus:border-blue-500 h-24 resize-none transition-all";

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

    const TablaVuelos = ({ titulo, listaVuelos, showFechaColumn = false }) => (
        <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700 flex flex-col h-full">
            <div className="px-4 py-3 bg-gray-700/60 border-b border-gray-600 flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-widest text-white capitalize">{titulo}</span>
                <span className="text-[10px] bg-gray-900 text-gray-300 font-mono px-2 py-1 rounded border border-gray-600">{listaVuelos.length} Vuelos</span>
            </div>
            <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-700 text-center">
                    <thead className="bg-gray-900/40">
                        <tr>
                            <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[40px]">Ctrl</th>
                            {showFechaColumn && <th className="px-2 py-3 text-[10px] font-bold text-blue-400 uppercase tracking-wider">Fecha Programada</th>}
                            <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aeronave</th>
                            <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">E.T.D</th>
                            <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">E.T.A</th>
                            <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Codigo</th>
                            <th className="px-2 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Dotación</th>
                            <th className="px-2 py-3 text-[10px] font-bold text-green-400 uppercase tracking-wider">Zona</th>
                            <th className="px-2 py-3 text-[10px] font-bold text-blue-400 uppercase tracking-wider">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/60 bg-gray-800/20">
                        {listaVuelos.map((vuelo) => (
                            <tr key={vuelo.id} className="hover:bg-gray-700/40 transition-colors even:bg-gray-800/40">
                                <td className="px-2 py-3 whitespace-nowrap bg-gray-900/30 border-r border-gray-700/40">
                                    {renderMarcaProgreso(vuelo.estado_progreso)}
                                </td>
                                {showFechaColumn && (
                                    <td className="px-2 py-3 whitespace-nowrap text-xs font-mono font-bold text-blue-300 uppercase bg-blue-500/5">
                                        {vuelo.fecha.split('-').reverse().join('/')}
                                    </td>
                                )}
                                <td className="px-2 py-3 whitespace-nowrap text-xs font-bold text-blue-400">{vuelo.aeronave}</td>
                                <td className="px-2 py-3 whitespace-nowrap text-xs font-mono text-gray-200">{vuelo.etd.substring(0, 5)}</td>
                                <td className="px-2 py-3 whitespace-nowrap text-xs font-mono text-gray-200">{vuelo.eta.substring(0, 5)}</td>
                                <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-300 font-medium">{vuelo.mision}</td>
                                <td className="px-2 py-3 whitespace-nowrap text-xs text-gray-300 text-center">
                                    <span className="font-semibold text-gray-200">{vuelo.instructor?.nombre || 'S/I'}</span> / <span className="text-gray-400">{vuelo.alumno?.nombre || 'S/A'}</span>
                                </td>
                                <td className="px-2 py-3 whitespace-nowrap text-xs font-bold text-green-400">{vuelo.nota || '-'}</td>
                                <td className="px-2 py-3 whitespace-nowrap text-xs">
                                    <button onClick={() => openEditModal(vuelo)} className="bg-gray-700/50 hover:bg-blue-600 text-gray-300 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all">Editar</button>
                                </td>
                            </tr>
                        ))}
                        {listaVuelos.length === 0 && (
                            <tr><td colSpan={showFechaColumn ? 9 : 8} className="px-6 py-8 text-xs text-gray-500 italic">No hay vuelos registrados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pizarra de Vuelo" />

            <div className="py-8 bg-gray-950 min-h-screen">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Pizarra Operativa</h1>
                            <p className="text-sm text-gray-400 mt-1">Línea de Vuelo: Escuela de Aviación Naval & VT-1</p>
                        </div>
                        <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
                            {vuelosFuturos.length > 0 && (
                                <button 
                                    onClick={() => setShowFuturos(!showFuturos)} 
                                    className={`font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-md transition-all active:scale-95 flex items-center justify-center space-x-2 flex-1 md:flex-none border ${showFuturos ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200'}`}
                                >
                                    <span>{showFuturos ? 'Ocultar Próximos Vuelos' : `Ver Próximos Vuelos (${vuelosFuturos.length})`}</span>
                                </button>
                            )}
                            <button onClick={() => setIsNovedadesModalOpen(true)} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-md transition-all active:scale-95 flex items-center justify-center space-x-2 flex-1 md:flex-none">
                                <span>Asignar Novedades Diarias</span>
                            </button>
                            <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-md transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 flex-1 md:flex-none">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                <span>Nuevo Vuelo</span>
                            </button>
                        </div>
                    </div>

                    {showFuturos && vuelosFuturos.length > 0 && (
                        <div className="animate-fade-in mb-4">
                            <TablaVuelos titulo="Planificación de Vuelos: Siguientes Días" listaVuelos={vuelosFuturos} showFechaColumn={true} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                        <TablaVuelos titulo={formatearFechaTablero(fechaAyer)} listaVuelos={vuelosAyer} />
                        <TablaVuelos titulo={formatearFechaTablero(fechaHoy)} listaVuelos={vuelosHoy} />
                    </div>

                    {/* SECCIÓN INFERIOR DE NOVEDADES */}
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Novedades Generales de la Jornada (Hoy)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 min-h-[120px] flex flex-col">
                                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-gray-700 pb-1.5 mb-2">Obs. Instructores</h4>
                                <p className="text-xs text-gray-200 whitespace-pre-line flex-grow">{novedadHoy?.obs_instructores || <span className="text-gray-600 italic">Sin novedades</span>}</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 min-h-[120px] flex flex-col">
                                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-gray-700 pb-1.5 mb-2">Obs. Alumnos</h4>
                                <p className="text-xs text-gray-200 whitespace-pre-line flex-grow">{novedadHoy?.obs_alumnos || <span className="text-gray-600 italic">Sin novedades</span>}</p>
                            </div>
                            
                            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 min-h-[120px] flex flex-col">
                                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-gray-700 pb-1.5 mb-2">Aeronaves</h4>
                                <div className="flex flex-col gap-1.5 flex-grow mt-1">
                                    {listaAeronavesHoy.map((aero, idx) => (
                                        <div key={idx} className="flex items-center space-x-3 bg-gray-900/60 px-2 py-1 rounded border border-gray-700/50">
                                            <span className="text-[11px] font-bold text-gray-300 w-[60px]">{aero.nombre}</span>
                                            <div className="flex items-center flex-grow space-x-2">
                                                {aero.estado === 'disponible' ? (
                                                    <svg className="w-4 h-4 text-blue-500 font-bold" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4 text-red-500 font-bold" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
                                                )}
                                                <span className="text-[11px] text-blue-300 font-mono uppercase tracking-wide truncate">{aero.detalle}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 min-h-[120px] flex flex-col">
                                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-gray-700 pb-1.5 mb-2">Piloto de Servicio</h4>
                                <p className="text-xs text-gray-200 whitespace-pre-line flex-grow">{novedadHoy?.piloto_servicio || <span className="text-gray-600 italic">Sin asignar</span>}</p>
                            </div>
                        </div>
                    </div>

                    {/* MODAL 1: REGISTRO / EDICIÓN DE VUELOS */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-800 border border-gray-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
                                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">{editingVuelo ? 'Modificar Misión' : 'Registrar Vuelo'}</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold focus:outline-none">&times;</button>
                                </div>
                                <form onSubmit={handleVueloSubmit} className="p-6 space-y-4">
                                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/60">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Estado del Vuelo en Tiempo Real</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            <button type="button" onClick={() => formVuelo.setData('estado_progreso', 'programado')} className={`py-2 rounded font-bold text-xs uppercase tracking-wide border transition-all flex justify-center items-center gap-1 ${formVuelo.data.estado_progreso === 'programado' ? 'bg-gray-700 border-gray-500 text-white font-black' : 'bg-gray-950 border-gray-800 text-gray-500 hover:text-gray-300'}`}>
                                                <span>-</span> Programado
                                            </button>
                                            <button type="button" onClick={() => formVuelo.setData('estado_progreso', 'en_vuelo')} className={`py-2 rounded font-bold text-xs uppercase tracking-wide border transition-all flex justify-center items-center gap-1 ${formVuelo.data.estado_progreso === 'en_vuelo' ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-black shadow-[0_0_8px_rgba(59,130,246,0.2)]' : 'bg-gray-950 border-gray-800 text-gray-500 hover:text-blue-400'}`}>
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 14l5 5L20 8" /></svg>
                                                En Vuelo
                                            </button>
                                            <button type="button" onClick={() => formVuelo.setData('estado_progreso', 'arribado')} className={`py-2 rounded font-bold text-xs uppercase tracking-wide border transition-all flex justify-center items-center gap-1 ${formVuelo.data.estado_progreso === 'arribado' ? 'bg-red-600/20 border-red-500 text-red-500 font-black shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'bg-gray-950 border-gray-800 text-gray-500 hover:text-red-500'}`}>
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 14l5 5L20 8" /><path d="M4 5l16 16" /></svg>
                                                Aterrizado
                                            </button>
                                            <button type="button" onClick={() => formVuelo.setData('estado_progreso', 'cancelado')} className={`py-2 rounded font-bold text-xs uppercase tracking-wide border transition-all flex justify-center items-center gap-1 ${formVuelo.data.estado_progreso === 'cancelado' ? 'bg-orange-600/20 border-orange-500 text-orange-500 font-black shadow-[0_0_8px_rgba(249,115,22,0.2)]' : 'bg-gray-950 border-gray-800 text-gray-500 hover:text-orange-500'}`}>
                                                <span>Cx</span> Cancelado
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Fecha</label><input type="date" value={formVuelo.data.fecha} onChange={e => formVuelo.setData('fecha', e.target.value)} className={inputStyle} required style={{ colorScheme: 'dark' }} /></div>
                                        
                                        {/* NUEVO CAMBIO: Selector relacional filtrado para Aeronaves */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Aeronave</label>
                                            <select 
                                                value={formVuelo.data.aeronave} 
                                                onChange={e => formVuelo.setData('aeronave', e.target.value)} 
                                                className={inputStyle} 
                                                required
                                            >
                                                <option value="" disabled className="text-gray-600">Seleccione Aeronave</option>
                                                {aeronavesDisponibles.map((aero, idx) => (
                                                    <option key={idx} value={aero.nombre} className="text-white">
                                                        {aero.nombre} {aero.estado === 'baja' ? '(ACTUAL - DE BAJA)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-300">E.T.D (Salida)</label><input type="time" value={formVuelo.data.etd} onChange={e => formVuelo.setData('etd', e.target.value)} className={inputStyle} required style={{ colorScheme: 'dark' }} /></div>
                                        <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-300">E.T.A (Llegada)</label><input type="time" value={formVuelo.data.eta} onChange={e => formVuelo.setData('eta', e.target.value)} className={inputStyle} required style={{ colorScheme: 'dark' }} /></div>
                                        <div className="sm:col-span-2"><label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Codigo de Vuelo</label><input type="text" placeholder="Ej: PS-3D" value={formVuelo.data.mision} onChange={e => formVuelo.setData('mision', e.target.value)} className={inputStyle} required /></div>
                                        <div className="sm:col-span-2 p-4 bg-gray-900/40 border border-gray-700/60 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2 text-[11px] font-bold uppercase tracking-widest text-blue-400 border-b border-gray-700/50 pb-1">Dotación de Vuelo</div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Instructor</label>
                                                <select value={formVuelo.data.instructor_id} onChange={e => formVuelo.setData('instructor_id', e.target.value)} className={inputStyle} required>
                                                    <option value="" disabled className="text-gray-600">Seleccione Instructor</option>
                                                    {instructores.map(inst => (<option key={inst.id} value={inst.id} className="text-white">{inst.nombre}</option>))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Alumno</label>
                                                <select value={formVuelo.data.alumno_id} onChange={e => formVuelo.setData('alumno_id', e.target.value)} className={inputStyle} required>
                                                    <option value="" disabled className="text-gray-600">Seleccione Alumno</option>
                                                    {alumnos.map(alum => (<option key={alum.id} value={alum.id} className="text-white">{alum.nombre}</option>))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2"><label className="block text-xs font-bold uppercase tracking-wider text-green-400">Zona de Vuelo</label><input type="text" placeholder="Ej: R-67" value={formVuelo.data.nota} onChange={e => formVuelo.setData('nota', e.target.value)} className={`${inputStyle} border-green-500/30 focus:border-green-500`} /></div>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/60 mt-4">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white">Cancelar</button>
                                        <button type="submit" disabled={formVuelo.processing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase py-2 px-5 rounded-md shadow-lg">{editingVuelo ? 'Guardar Cambios' : 'Anotar en Pizarra'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL 2: NOVEDADES */}
                    {isNovedadesModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-800 border border-gray-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center shrink-0">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Asignar Novedades Generales</h3>
                                    <button onClick={() => setIsNovedadesModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold focus:outline-none">&times;</button>
                                </div>
                                <div className="p-6 overflow-y-auto flex-grow">
                                    <form id="form-novedades" onSubmit={handleNovedadesSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Obs. Instructores</label><textarea placeholder="Novedades instructores..." value={formNovedades.data.obs_instructores} onChange={e => formNovedades.setData('obs_instructores', e.target.value)} className={textareaStyle} /></div>
                                            <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Obs. Alumnos</label><textarea placeholder="Ej: OPS: T2 Viani" value={formNovedades.data.obs_alumnos} onChange={e => formNovedades.setData('obs_alumnos', e.target.value)} className={textareaStyle} /></div>
                                            <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Piloto de Servicio</label><textarea placeholder="Asignación..." value={formNovedades.data.piloto_servicio} onChange={e => formNovedades.setData('piloto_servicio', e.target.value)} className={textareaStyle} /></div>
                                            <div className="md:col-span-2 mt-2">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-3 border-b border-gray-700 pb-2">Control de Estado de Aeronaves</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {formNovedades.data.aeronaves.map((aero, idx) => (
                                                        <div key={idx} className="flex items-center space-x-2 bg-gray-900/50 p-2 rounded border border-gray-700">
                                                            <span className="text-xs font-bold text-gray-300 w-[65px] shrink-0">{aero.nombre}</span>
                                                            <select value={aero.estado} onChange={(e) => updateAeronave(idx, 'estado', e.target.value)} className="bg-gray-800 border border-gray-600 text-xs font-bold text-white rounded px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none shrink-0">
                                                                <option value="disponible" className="text-blue-400">↑ DISP</option>
                                                                <option value="baja" className="text-red-400">↓ BAJA</option>
                                                            </select>
                                                            <input type="text" placeholder="Notas" value={aero.detalle} onChange={(e) => updateAeronave(idx, 'detalle', e.target.value)} className="bg-gray-800 border border-gray-600 text-xs text-white rounded px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 w-full outline-none placeholder-gray-600" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-700/60 bg-gray-900/50 flex justify-end space-x-3 shrink-0">
                                    <button type="button" onClick={() => setIsNovedadesModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white">Cancelar</button>
                                    <button type="submit" form="form-novedades" disabled={formNovedades.processing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase py-2 px-5 rounded-md shadow-lg">Actualizar Tablero</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}