import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

const LISTA_AERONAVES = ['NAVAL 211', 'NAVAL 212', 'NAVAL 213', 'NAVAL 215', 'NAVAL 216', 'NAVAL 217', 'NAVAL 219'];

export default function Pizarra({ auth, vuelos, instructores, alumnos, fechaHoy, fechaAyer, novedadHoy, novedadAyer, ultimoEstadoAeronaves }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNovedadesModalOpen, setIsNovedadesModalOpen] = useState(false);
    const [editingVuelo, setEditingVuelo] = useState(null);
    const [showFuturos, setShowFuturos] = useState(false);
    const [activeTabNovedades, setActiveTabNovedades] = useState('instructores');
    const [isCustomZona, setIsCustomZona] = useState(false);

    const initAeronaves = (guardadasHoy, historico) => {
        if (guardadasHoy && Array.isArray(guardadasHoy) && guardadasHoy.length > 0) return guardadasHoy;
        if (historico && Array.isArray(historico) && historico.length > 0) return historico;
        return LISTA_AERONAVES.map(nombre => ({ nombre, estado: 'disponible', detalle: '' }));
    };

    const initObsInstructores = (guardadas, listaInstructores) => {
        const guardadasMap = Array.isArray(guardadas) 
            ? guardadas.reduce((acc, curr) => ({...acc, [curr.id]: curr.observacion}), {}) 
            : {};
        return listaInstructores.map(inst => ({
            id: inst.id,
            nombre: inst.nombre,
            observacion: guardadasMap[inst.id] || ''
        }));
    };

    const initObsAlumnos = (guardadas, listaAlumnos) => {
        const guardadasMap = Array.isArray(guardadas) 
            ? guardadas.reduce((acc, curr) => ({...acc, [curr.id]: curr.observacion}), {}) 
            : {};
        return listaAlumnos.map(alum => ({
            id: alum.id,
            nombre: alum.nombre,
            observacion: guardadasMap[alum.id] || ''
        }));
    };

    const formVuelo = useForm({
        fecha: fechaHoy,
        aeronave: '',
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
        obs_instructores: initObsInstructores(novedadHoy?.obs_instructores, instructores), 
        obs_alumnos: initObsAlumnos(novedadHoy?.obs_alumnos, alumnos),
        aeronaves: initAeronaves(novedadHoy?.aeronaves, ultimoEstadoAeronaves),
        piloto_servicio: novedadHoy?.piloto_servicio || '',
    });

    useEffect(() => {
        if (novedadHoy) {
            formNovedades.setData({
                fecha: fechaHoy,
                obs_instructores: initObsInstructores(novedadHoy.obs_instructores, instructores),
                obs_alumnos: initObsAlumnos(novedadHoy.obs_alumnos, alumnos),
                aeronaves: initAeronaves(novedadHoy.aeronaves, ultimoEstadoAeronaves),
                piloto_servicio: novedadHoy.piloto_servicio || '',
            });
        }
    }, [novedadHoy]);

    const vuelosHoy = vuelos.filter(v => v.fecha === fechaHoy);
    const vuelosAyer = vuelos.filter(v => v.fecha === fechaAyer);
    const vuelosFuturos = vuelos.filter(v => v.fecha > fechaHoy);

    const listaAeronavesHoy = initAeronaves(novedadHoy?.aeronaves, ultimoEstadoAeronaves);
    const aeronavesDisponibles = listaAeronavesHoy.filter(aero => aero.estado === 'disponible');

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
        setIsCustomZona(false); // Reseteamos la zona a las predefinidas
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
        
        // Detectamos si la zona guardada es una de las opciones fijas o fue escrita a mano
        const zonaActual = vuelo.nota || '';
        setIsCustomZona(!['', 'R-1', 'R-35', 'R-67'].includes(zonaActual));
        
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
                        <svg className="w-5 h-5 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 14l5 5L20 8" /></svg>
                    </div>
                );
            case 'arribado':
                return (
                    <div className="flex justify-center items-center relative">
                        <svg className="w-5 h-5 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 14l5 5L20 8" /><path d="M4 5l16 16" /></svg>
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
                            <button onClick={() => { setActiveTabNovedades('instructores'); setIsNovedadesModalOpen(true); }} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-md transition-all active:scale-95 flex items-center justify-center space-x-2 flex-1 md:flex-none">
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

                    {/* SECCIÓN INFERIOR: NOVEDADES REESTRUCTURADA */}
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Novedades Operativas del Día</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* COLUMNA IZQUIERDA: PERSONAL (Ocupa 8 columnas) */}
                            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Instructores - Estilo lista compacta */}
                                <div className="bg-gray-800/30 rounded border border-gray-700 p-3">
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase border-b border-gray-700 pb-1 mb-2">Instructores</h4>
                                    <div className="flex flex-col gap-1">
                                        {Array.isArray(novedadHoy?.obs_instructores) && novedadHoy.obs_instructores.filter(o => o?.observacion?.trim()).map((obs, idx) => (
                                            <div key={idx} className="flex gap-2 text-[11px]">
                                                <span className="font-bold text-blue-300 w-24 shrink-0 truncate">{obs.nombre}:</span>
                                                <span className="text-gray-300">{obs.observacion}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Alumnos - Estilo lista compacta */}
                                <div className="bg-gray-800/30 rounded border border-gray-700 p-3">
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase border-b border-gray-700 pb-1 mb-2">Alumnos</h4>
                                    <div className="flex flex-col gap-1">
                                        {Array.isArray(novedadHoy?.obs_alumnos) && novedadHoy.obs_alumnos.filter(o => o?.observacion?.trim()).map((obs, idx) => (
                                            <div key={idx} className="flex gap-2 text-[11px]">
                                                <span className="font-bold text-green-400 w-24 shrink-0 truncate">{obs.nombre}:</span>
                                                <span className="text-gray-300">{obs.observacion}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: OPERACIONES (Ocupa 4 columnas) */}
                            <div className="lg:col-span-4 flex flex-col gap-4">
                                {/* Aeronaves - Tabla muy compacta */}
                                <div className="bg-gray-800/30 rounded border border-gray-700 p-3">
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase border-b border-gray-700 pb-1 mb-2">Aeronaves</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        {listaAeronavesHoy.map((aero, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-[10px]">
                                                <span className={`w-2 h-2 rounded-full ${aero.estado === 'disponible' ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                                                <span className="text-gray-300 font-bold">{aero.nombre}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Piloto de servicio */}
                                <div className="bg-gray-800/30 rounded border border-gray-700 p-3">
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase border-b border-gray-700 pb-1 mb-2">Piloto de Servicio</h4>
                                    <p className="text-[11px] text-gray-300">{novedadHoy?.piloto_servicio || '-'}</p>
                                </div>
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
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Aeronave</label>
                                            <select value={formVuelo.data.aeronave} onChange={e => formVuelo.setData('aeronave', e.target.value)} className={inputStyle} required>
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
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-green-400 mb-1">Zona de Vuelo</label>
                                            <div className="flex space-x-2">
                                                <select 
                                                    value={isCustomZona ? 'Otra' : (formVuelo.data.nota || '')} 
                                                    onChange={(e) => {
                                                        if (e.target.value === 'Otra') {
                                                            setIsCustomZona(true);
                                                            formVuelo.setData('nota', ''); // Limpia para que escribas desde cero
                                                        } else {
                                                            setIsCustomZona(false);
                                                            formVuelo.setData('nota', e.target.value); // Asigna la zona seleccionada
                                                        }
                                                    }} 
                                                    className={`${inputStyle} ${isCustomZona ? 'w-1/3' : 'w-full'} border-green-500/30 focus:border-green-500 mt-0`}
                                                >
                                                    <option value="" disabled className="text-gray-600">Seleccione Zona</option>
                                                    <option value="R-1" className="text-white">R-1</option>
                                                    <option value="R-35" className="text-white">R-35</option>
                                                    <option value="R-67" className="text-white">R-67</option>
                                                    <option value="Otra" className="text-yellow-400">Otra (Especificar)</option>
                                                </select>
                                                {/* Solo se muestra si seleccionaste "Otra" o si el vuelo editado tiene un texto distinto */}
                                                {isCustomZona && (
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ej: Raid a SCEL..." 
                                                        value={formVuelo.data.nota} 
                                                        onChange={e => formVuelo.setData('nota', e.target.value)} 
                                                        className={`${inputStyle} w-2/3 border-green-500/30 focus:border-green-500 mt-0`} 
                                                        autoFocus
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/60 mt-4">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white">Cancelar</button>
                                        <button type="submit" disabled={formVuelo.processing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase py-2 px-5 rounded-md shadow-lg">{editingVuelo ? 'Guardar Cambios' : 'Anotar en Pizarra'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL 2: NOVEDADES CON PESTAÑAS (TABS REORDENADAS) */}
                    {isNovedadesModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-800 border border-gray-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
                                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center shrink-0">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Asignar Novedades Generales</h3>
                                    <button onClick={() => setIsNovedadesModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold focus:outline-none">&times;</button>
                                </div>
                                
                                {/* NAVEGACIÓN DE PESTAÑAS - ORDEN REVISADO */}
                                <div className="flex border-b border-gray-700 bg-gray-900/30 overflow-x-auto">
                                    <button 
                                        type="button"
                                        onClick={() => setActiveTabNovedades('instructores')} 
                                        className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all min-w-[120px] ${activeTabNovedades === 'instructores' ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
                                    >
                                        Instructores
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setActiveTabNovedades('alumnos')} 
                                        className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all min-w-[120px] ${activeTabNovedades === 'alumnos' ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
                                    >
                                        Alumnos
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setActiveTabNovedades('aeronaves')} 
                                        className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all min-w-[120px] ${activeTabNovedades === 'aeronaves' ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
                                    >
                                        Aeronaves
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setActiveTabNovedades('general')} 
                                        className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all min-w-[120px] ${activeTabNovedades === 'general' ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'}`}
                                    >
                                        General
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto max-h-[60vh] min-h-[300px]">
                                    <form id="form-novedades" onSubmit={handleNovedadesSubmit} className="space-y-6">
                                        
                                        {/* 1. PESTAÑA: INSTRUCTORES */}
                                        {activeTabNovedades === 'instructores' && (
                                            <div className="animate-fade-in">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {formNovedades.data.obs_instructores.map((obs, idx) => (
                                                        <div key={obs.id} className="flex flex-col bg-gray-900/50 p-2 rounded border border-gray-700 focus-within:border-blue-500 transition-colors">
                                                            <span className="text-[11px] font-bold text-gray-300 mb-1">{obs.nombre}</span>
                                                            <textarea
                                                                value={obs.observacion}
                                                                onChange={(e) => {
                                                                    const nuevas = [...formNovedades.data.obs_instructores];
                                                                    nuevas[idx].observacion = e.target.value;
                                                                    formNovedades.setData('obs_instructores', nuevas);
                                                                }}
                                                                placeholder="Sin novedad..."
                                                                className={textareaStyle + " h-16 bg-gray-950"}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 2. PESTAÑA: ALUMNOS */}
                                        {activeTabNovedades === 'alumnos' && (
                                            <div className="animate-fade-in">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {formNovedades.data.obs_alumnos.map((obs, idx) => (
                                                        <div key={obs.id} className="flex flex-col bg-gray-900/50 p-2 rounded border border-gray-700 focus-within:border-blue-500 transition-colors">
                                                            <span className="text-[11px] font-bold text-gray-300 mb-1">{obs.nombre}</span>
                                                            <textarea
                                                                value={obs.observacion}
                                                                onChange={(e) => {
                                                                    const nuevas = [...formNovedades.data.obs_alumnos];
                                                                    nuevas[idx].observacion = e.target.value;
                                                                    formNovedades.setData('obs_alumnos', nuevas);
                                                                }}
                                                                placeholder="Sin novedad..."
                                                                className={textareaStyle + " h-16 bg-gray-950"}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 3. PESTAÑA: AERONAVES */}
                                        {activeTabNovedades === 'aeronaves' && (
                                            <div className="animate-fade-in">
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
                                        )}

                                        {/* 4. PESTAÑA: GENERAL (PILOTO DE SERVICIO) */}
                                        {activeTabNovedades === 'general' && (
                                            <div className="grid grid-cols-1 gap-4 animate-fade-in">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">Piloto de Servicio</label>
                                                    <textarea placeholder="Asignación..." value={formNovedades.data.piloto_servicio} onChange={e => formNovedades.setData('piloto_servicio', e.target.value)} className={textareaStyle + " h-24"} />
                                                </div>
                                            </div>
                                        )}
                                        
                                    </form>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-700/60 bg-gray-900/50 flex justify-end space-x-3 shrink-0">
                                    <button type="button" onClick={() => setIsNovedadesModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white transition-colors">Cancelar</button>
                                    <button type="submit" form="form-novedades" disabled={formNovedades.processing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase py-2 px-5 rounded-md shadow-lg transition-colors">Actualizar Tablero</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}