import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; // Asegura que 'router' esté importado


const LISTA_AERONAVES = ['NAVAL 211', 'NAVAL 212', 'NAVAL 213', 'NAVAL 215', 'NAVAL 216', 'NAVAL 217', 'NAVAL 219'];

const ETAPAS_CURSO = [
    { id: 'pre_solo', nombre: 'Pre Solo', misiones: ['SPS-1D', 'PS-1D', 'SPS-2D', 'PS-2D', 'PS-3D', 'SPS-3D', 'PS-4D', 'PS-5D', 'SPS-4D', 'PS-6D', 'PS-7D', 'PS-8D', 'PS-9D', 'SPS-5D', 'PS-10D', 'PS-11D', 'PS-12D', 'PS-13D', 'PS-14D', 'PS-15D', 'PS-16D', 'PS-17DX', 'PS-17S', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'precision', nombre: 'Precisión', misiones: ['SP-1D', 'P-1D', 'P-2S', 'P-3D', 'P-4S', 'P-5D', 'P-6S', 'P-7D', 'P-8S', 'P-9D', 'P-10S', 'P-11D', 'P-12DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'acrobacias', nombre: 'Acrobacias', misiones: ['A-1D', 'A-2D', 'A-3D', 'A-4S', 'A-5D', 'A-6S', 'A-7D', 'A-8S', 'A-9D', 'A-10DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'navegacion', nombre: 'Navegación', misiones: ['SNV-1D', 'NV-1D', 'NV-2D', 'NV-3D', 'NV-4D', 'NV-5D', 'NV-6DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'instrumentos_basicos', nombre: 'Inst. Básicos', misiones: ['SIB-1D', 'IB-1D', 'SIB-2D', 'IB-2D', 'SIB-3D', 'IB-3D', 'SIB-4D', 'IB-4D', 'SIB-5D', 'IB-5D', 'SIB-6D', 'IB-6DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'radio_instrumento', nombre: 'Radio Inst.', misiones: ['SRI-1D', 'RI-1D', 'SRI-2D', 'RI-2D', 'SRI-3D', 'RI-3D', 'SRI-4D', 'RI-4D', 'SRI-5D', 'RI-5D', 'SRI-6D', 'RI-6D', 'SRI-7D', 'RI-7D', 'SRI-8D', 'RI-8D', 'SRI-9D', 'RI-9D', 'RI-10D', 'RI-11D', 'RI-12D', 'RI-13D', 'RI-14D', 'RI-15D', 'RI-16DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'formacion', nombre: 'Formación', misiones: ['F-1D', 'F-2D', 'F-3D', 'F-4D', 'F-5D', 'F-6D', 'F-7D', 'F-8DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'nocturno', nombre: 'Nocturno', misiones: ['N-1D', 'N-2D', 'N-3D', 'N-4DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] }
];

export default function Pizarra({ auth, vuelos, instructores, alumnos, fechaHoy, novedadHoy, ultimoEstadoAeronaves, ultimoEstadoInstructores, ultimoEstadoAlumnos }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNovedadesModalOpen, setIsNovedadesModalOpen] = useState(false);
    const [editingVuelo, setEditingVuelo] = useState(null);
    const [showFuturos, setShowFuturos] = useState(false);
    const [activeTabNovedades, setActiveTabNovedades] = useState('instructores');
    const [isCustomZona, setIsCustomZona] = useState(false);
    const [isCustomMision, setIsCustomMision] = useState(false);
    const [errorValidacion, setErrorValidacion] = useState('');

    const initAeronaves = (guardadasHoy, historico) => {
        if (guardadasHoy && Array.isArray(guardadasHoy) && guardadasHoy.length > 0) return guardadasHoy;
        if (historico && Array.isArray(historico) && historico.length > 0) return historico;
        return LISTA_AERONAVES.map(nombre => ({ nombre, estado: 'disponible', detalle: '' }));
    };

    // Si hoy ya tiene su propio registro de novedades (aunque esté en blanco
    // porque alguien borró una observación), ese es el estado real más
    // reciente y gana. Antes se ignoraba un registro de hoy "en blanco" y se
    // seguía heredando de un día anterior con contenido, lo que resucitaba
    // notas ya borradas al día siguiente (bug real, corregido acá) — mismo
    // criterio que ya usa initAeronaves.
    const initObsInstructores = (guardadasHoy, historico, listaInstructores) => {
        const fuente = Array.isArray(guardadasHoy) && guardadasHoy.length > 0
            ? guardadasHoy
            : (Array.isArray(historico) ? historico : []);
        const mapa = fuente.reduce((acc, curr) => ({...acc, [curr.id]: curr.observacion}), {});
        return listaInstructores.map(inst => ({
            id: inst.id,
            // Priorizamos el nombre de combate, si no existe usamos el nombre normal
            nombre: inst.nombre_combate || inst.nombre,
            observacion: mapa[inst.id] || ''
        }));
    };

    const initObsAlumnos = (guardadasHoy, historico, listaAlumnos) => {
        const fuente = Array.isArray(guardadasHoy) && guardadasHoy.length > 0
            ? guardadasHoy
            : (Array.isArray(historico) ? historico : []);
        const mapa = fuente.reduce((acc, curr) => ({...acc, [curr.id]: curr.observacion}), {});
        return listaAlumnos.map(alum => ({
            id: alum.id,
            nombre: alum.nombre,
            observacion: mapa[alum.id] || ''
        }));
    };

    const formVuelo = useForm({
        fecha: fechaHoy,
        aeronave: '',
        etd: '',
        eta: '',
        mision: '',
        instructor_id: '',
        instructor_validador_id: '',
        alumno_id: '',
        nota: '',
        estado_progreso: 'programado'
    });

    const formNovedades = useForm({
        fecha: fechaHoy,
        obs_instructores: initObsInstructores(novedadHoy?.obs_instructores, ultimoEstadoInstructores, instructores),
        obs_alumnos: initObsAlumnos(novedadHoy?.obs_alumnos, ultimoEstadoAlumnos, alumnos),
        aeronaves: initAeronaves(novedadHoy?.aeronaves, ultimoEstadoAeronaves),
        piloto_servicio: novedadHoy?.piloto_servicio || '',
        actividades: novedadHoy?.actividades || '',
    });

    useEffect(() => {
        if (novedadHoy) {
            formNovedades.setData({
                fecha: fechaHoy,
                obs_instructores: initObsInstructores(novedadHoy.obs_instructores, ultimoEstadoInstructores, instructores),
                obs_alumnos: initObsAlumnos(novedadHoy.obs_alumnos, ultimoEstadoAlumnos, alumnos),
                aeronaves: initAeronaves(novedadHoy.aeronaves, ultimoEstadoAeronaves),
                piloto_servicio: novedadHoy.piloto_servicio || '',
                actividades: novedadHoy.actividades || '',
            });
        }
    }, [novedadHoy]);

    // CALCULAMOS LA FECHA DE MAÑANA
    const [year, month, day] = fechaHoy.split('-');
    const dateManana = new Date(year, month - 1, day);
    dateManana.setDate(dateManana.getDate() + 1);
    const fechaManana = `${dateManana.getFullYear()}-${String(dateManana.getMonth() + 1).padStart(2, '0')}-${String(dateManana.getDate()).padStart(2, '0')}`;

    // FILTRAMOS LOS VUELOS
    const vuelosHoy = vuelos.filter(v => v.fecha === fechaHoy);
    const vuelosManana = vuelos.filter(v => v.fecha === fechaManana);
    const vuelosFuturos = vuelos.filter(v => v.fecha > fechaManana);

    const listaAeronavesHoy = initAeronaves(novedadHoy?.aeronaves, ultimoEstadoAeronaves);
    // Lista de instructores activos con su observación (heredada de días previos si hoy
    // no se cargó nada todavía) para el panel de solo lectura de Novedades del Día.
    const instructoresNovedadHoy = initObsInstructores(novedadHoy?.obs_instructores, ultimoEstadoInstructores, instructores);
    // A diferencia de instructores, acá solo mostramos a quien tiene una observación
    // cargada (heredada o de hoy) — no a todos los alumnos activos.
    const alumnosConObservacion = initObsAlumnos(novedadHoy?.obs_alumnos, ultimoEstadoAlumnos, alumnos)
        .filter(obs => obs.observacion?.trim());
    // Mostramos todas las aeronaves, incluidas las de baja: un instructor tiene
    // que poder seleccionar una aeronave de baja para hacerle el vuelo de FTR
    // que la vuelve a poner disponible (si la ocultáramos, nunca se podría volar
    // ese FTR).
    const aeronavesDisponibles = listaAeronavesHoy;

    const formatearFechaTablero = (fechaString) => {
        if (!fechaString) return '';
        const [year, month, day] = fechaString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long' });
    };

    const openCreateModal = () => {
        setEditingVuelo(null);
        formVuelo.reset('aeronave', 'etd', 'eta', 'mision', 'instructor_id', 'instructor_validador_id', 'alumno_id', 'nota', 'estado_progreso');
        formVuelo.setData('fecha', fechaHoy);
        setIsCustomZona(false);
        setErrorValidacion('');
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
            instructor_validador_id: vuelo.instructor_validador_id,
            alumno_id: vuelo.alumno_id,
            nota: vuelo.nota || '',
            estado_progreso: vuelo.estado_progreso || 'programado',
            calificacion: vuelo.calificacion || 'pendiente' // Aseguramos traer la calificación
        });
        const zonaActual = vuelo.nota || '';
        setIsCustomZona(!['', 'R-1', 'R-35', 'R-67'].includes(zonaActual));

        // NUEVA LÍNEA PARA LA MISIÓN
        const misionActual = vuelo.mision || '';
        const esMisionSyllabus = misionActual === 'FTR' || ETAPAS_CURSO.some(etapa => etapa.misiones.includes(misionActual));
        setIsCustomMision(!esMisionSyllabus && misionActual !== '');
        
        setErrorValidacion('');
        setIsModalOpen(true);
    };

    const handleVueloSubmit = (e) => {
        e.preventDefault();
        setErrorValidacion(''); // Limpiamos el error al intentar guardar

        const mision = formVuelo.data.mision ? formVuelo.data.mision.toUpperCase() : '';
        const aeronave = formVuelo.data.aeronave;

        // LÓGICA DE VALIDACIÓN ESTRICTA
        const isSimMission = mision.startsWith('S') || mision.includes('SIM');
        const isSimAircraft = aeronave === 'SIM';

        if (isSimMission && !isSimAircraft) {
            setErrorValidacion('INCONGRUENCIA: Las misiones de Simulador (inician con S) no pueden registrarse en una aeronave real. Cambie la aeronave a "SIMULADOR".');
            return; // Bloquea el guardado
        }

        if (!isSimMission && isSimAircraft) {
            setErrorValidacion('INCONGRUENCIA: Está intentando registrar un vuelo real (misión sin prefijo S) en el Simulador. Seleccione una aeronave válida (Ej: NAVAL 211).');
            return; // Bloquea el guardado
        }

        // Una aeronave de baja solo puede volar con código FTR (es el vuelo que la
        // saca de ese estado), y el código FTR es exclusivo de una aeronave de baja.
        const aeronaveSeleccionada = aeronavesDisponibles.find(a => a.nombre === aeronave);
        const esAeronaveDeBaja = aeronaveSeleccionada?.estado === 'baja';
        const esMisionFtr = mision === 'FTR';

        if (esAeronaveDeBaja && !esMisionFtr) {
            setErrorValidacion('INCONGRUENCIA: Esta aeronave está de baja. Solo se le puede registrar un vuelo con código FTR.');
            return;
        }

        if (esMisionFtr && !esAeronaveDeBaja) {
            setErrorValidacion('INCONGRUENCIA: El código FTR es solo para una aeronave que está de baja. Seleccione la aeronave correspondiente.');
            return;
        }

        // Puede volar solo el alumno o solo el instructor (vuelo solo / FTR), pero no
        // pueden faltar los dos a la vez.
        if (!formVuelo.data.instructor_id && !formVuelo.data.alumno_id) {
            setErrorValidacion('Falta asignar instructor o alumno: un vuelo solo necesita al menos uno de los dos.');
            return;
        }

        // El alumno solo puede volar sin instructor en una misión designada como
        // "solo" en el syllabus (código terminado en S, ej. PS-17S, P-2S, A-4S).
        if (!formVuelo.data.instructor_id && formVuelo.data.alumno_id && !mision.endsWith('S')) {
            setErrorValidacion('INCONGRUENCIA: Sin instructor asignado, solo se puede registrar una misión de tipo solo (código terminado en "S"). Asigne un instructor o cambie el código de misión.');
            return;
        }

        submitFinalPayload(formVuelo.data);
    };

    const submitFinalPayload = (payload) => {
        // El servidor valida cosas que acá no podemos saber sin ir a la base
        // (ej. código de misión duplicado para ese alumno); si rechaza, mostramos
        // el motivo en el mismo cartel de INCONGRUENCIA en vez de fallar en silencio.
        const onError = (errors) => setErrorValidacion(Object.values(errors)[0] || 'No se pudo guardar el vuelo.');

        if (editingVuelo) {
            router.put(route('pizarra.update', editingVuelo.id), payload, {
                onSuccess: () => { formVuelo.reset(); setEditingVuelo(null); setIsModalOpen(false); },
                onError
            });
        } else {
            router.post(route('pizarra.store'), payload, {
                onSuccess: () => { formVuelo.reset(); setIsModalOpen(false); },
                onError
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
                                    {vuelo.instructor && vuelo.alumno ? (
                                        <>
                                            <span className="font-semibold text-gray-200">
                                                {vuelo.instructor.nombre_combate || vuelo.instructor.nombre}
                                            </span> / <span className="text-gray-400">
                                                {vuelo.alumno.nombre}
                                            </span>
                                        </>
                                    ) : (
                                        // Vuelo solo (alumno o instructor sin el otro): mostramos
                                        // solo el nombre de quien vuela, sin el "/ S/A" o "S/I /".
                                        <span className="font-semibold text-gray-200">
                                            {vuelo.instructor?.nombre_combate || vuelo.instructor?.nombre || vuelo.alumno?.nombre}
                                        </span>
                                    )}
                                    {vuelo.instructor_validador && (
                                        <div className="text-[10px] text-purple-400 font-bold mt-0.5">
                                            Validado por {vuelo.instructor_validador.nombre_combate || vuelo.instructor_validador.nombre}
                                        </div>
                                    )}
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
                        <TablaVuelos titulo={formatearFechaTablero(fechaHoy)} listaVuelos={vuelosHoy} />
                        <TablaVuelos titulo={formatearFechaTablero(fechaManana)} listaVuelos={vuelosManana} />
                    </div>

                    {/* SECCIÓN INFERIOR: NOVEDADES REESTRUCTURADA CON MEJOR DISEÑO */}
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Novedades Operativas del Día</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                            
                            {/* COLUMNA IZQUIERDA: PERSONAL (Ocupa 8 columnas) */}
                            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Instructores - Tarjetas Verticales Amplias */}
                                <div className="bg-gray-800/40 rounded-lg border border-gray-700 p-4 flex flex-col">
                                    <h4 className="text-[11px] font-bold text-blue-400 uppercase border-b border-gray-700 pb-2 mb-4">Instructores</h4>
                                    <div className="flex flex-col gap-3 flex-grow">
                                        {instructoresNovedadHoy.length > 0 ? (
                                            instructoresNovedadHoy.map((obs) => (
                                                <div key={obs.id} className="flex flex-col bg-gray-900/60 p-3 rounded-md border border-gray-700/50 shadow-sm">
                                                    <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-1.5 border-b border-gray-800 pb-1">{obs.nombre}</span>
                                                    {obs.observacion?.trim() ? (
                                                        <p className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{obs.observacion}</p>
                                                    ) : (
                                                        <p className="text-[11px] text-gray-500/70 italic">Sin novedades</p>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex items-center justify-center flex-grow min-h-[80px]">
                                                <span className="text-gray-500/70 italic text-xs font-medium">No hay instructores activos</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Alumnos - Tarjetas Verticales Amplias */}
                                <div className="bg-gray-800/40 rounded-lg border border-gray-700 p-4 flex flex-col">
                                    <h4 className="text-[11px] font-bold text-blue-400 uppercase border-b border-gray-700 pb-2 mb-4">Alumnos</h4>
                                    <div className="flex flex-col gap-3 flex-grow">
                                        {alumnosConObservacion.length > 0 ? (
                                            alumnosConObservacion.map((obs) => (
                                                <div key={obs.id} className="flex flex-col bg-gray-900/60 p-3 rounded-md border border-gray-700/50 shadow-sm">
                                                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1.5 border-b border-gray-800 pb-1">{obs.nombre}</span>
                                                    <p className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{obs.observacion}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex items-center justify-center flex-grow min-h-[80px]">
                                                <span className="text-gray-500/70 italic text-xs font-medium">Sin observaciones ingresadas</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: OPERACIONES (Ocupa 4 columnas) */}
                            <div className="lg:col-span-4 flex flex-col gap-4">
                                
                                {/* Aeronaves - Mini Tarjetas Destacadas */}
                                <div className="bg-gray-800/40 rounded-lg border border-gray-700 p-4">
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase border-b border-gray-700 pb-1.5 mb-3">Aeronaves</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {listaAeronavesHoy.map((aero, idx) => (
                                            <div key={idx} className="flex flex-col gap-1 bg-gray-900/50 p-2.5 rounded border border-gray-700/60 shadow-inner">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${aero.estado === 'disponible' ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'}`}></span>
                                                    <span className="text-gray-200 text-[11px] font-bold tracking-wider">{aero.nombre}</span>
                                                </div>
                                                {/* Diseño blindado para notas de aeronave muy largas */}
                                                {aero.detalle && aero.detalle.trim() !== '' && (
                                                    <div className="pl-4 mt-0.5">
                                                        <p className="text-gray-300 text-[10px] leading-snug font-medium border-l-2 border-gray-500/50 pl-2 py-0.5 break-words whitespace-pre-wrap">
                                                            {aero.detalle}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Piloto de servicio */}
                                <div className="bg-gray-800/40 rounded-lg border border-gray-700 p-4">
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase border-b border-gray-700 pb-1.5 mb-2">Piloto de Servicio</h4>
                                    <p className="text-[11px] text-gray-300 whitespace-pre-line leading-relaxed font-medium break-words">{novedadHoy?.piloto_servicio || <span className="text-gray-500/70 italic">Sin asignar</span>}</p>
                                </div>

                                {/* Actividades */}
                                <div className="bg-gray-800/40 rounded-lg border border-gray-700 p-4 flex-grow">
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase border-b border-gray-700 pb-1.5 mb-2">Actividades</h4>
                                    <p className="text-[11px] text-gray-300 whitespace-pre-line leading-relaxed font-medium break-words">
                                        {novedadHoy?.actividades || <span className="text-gray-500/70 italic">Sin actividades programadas</span>}
                                    </p>
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
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Aeronave / Simulador</label>
                                            <select 
                                                value={formVuelo.data.aeronave} 
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (val === 'SIM') {
                                                        formVuelo.setData(prev => ({ ...prev, aeronave: val, nota: '' }));
                                                    } else {
                                                        formVuelo.setData('aeronave', val);
                                                    }
                                                }} 
                                                className={inputStyle} 
                                                required
                                            >
                                                <option value="" disabled className="text-gray-600">Seleccione Aeronave</option>
                                                <option value="SIM" className="text-blue-400 font-black bg-gray-900">SIMULADOR (SIM)</option>
                                                {aeronavesDisponibles.map((aero, idx) => (
                                                    <option key={idx} value={aero.nombre} className={aero.estado === 'baja' ? 'text-red-400' : 'text-white'}>
                                                        {aero.nombre} {aero.estado === 'baja' ? '(DE BAJA - Solo FTR)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-300">E.T.D (Salida)</label><input type="time" value={formVuelo.data.etd} onChange={e => formVuelo.setData('etd', e.target.value)} className={inputStyle} required style={{ colorScheme: 'dark' }} /></div>
                                        <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-300">E.T.A (Llegada)</label><input type="time" value={formVuelo.data.eta} onChange={e => formVuelo.setData('eta', e.target.value)} className={inputStyle} required style={{ colorScheme: 'dark' }} /></div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">Código de Misión / Vuelo</label>
                                            <div className="flex space-x-2">
                                                <select 
                                                    value={isCustomMision ? 'Otra' : (formVuelo.data.mision || '')} 
                                                    onChange={(e) => {
                                                        const valorSeleccionado = e.target.value;
                                                        
                                                        if (valorSeleccionado === 'Otra') {
                                                            setIsCustomMision(true);
                                                            formVuelo.setData('mision', '');
                                                        } else {
                                                            setIsCustomMision(false);
                                                            
                                                            // LÓGICA INTELIGENTE: Si empieza con "S", asignamos el Simulador automáticamente y borramos zona
                                                            if (valorSeleccionado.startsWith('S')) {
                                                                formVuelo.setData(prev => ({
                                                                    ...prev,
                                                                    mision: valorSeleccionado,
                                                                    aeronave: 'SIM',
                                                                    nota: '' // <-- Vaciamos la zona
                                                                }));
                                                            } else {
                                                                formVuelo.setData('mision', valorSeleccionado);
                                                            }
                                                        }
                                                    }} 
                                                    className={`${inputStyle} ${isCustomMision ? 'w-1/3' : 'w-full'} mt-0`}
                                                    required
                                                >
                                                    <option value="" disabled className="text-gray-600">Seleccione Misión</option>
                                                    <option value="FTR" className="text-purple-400 font-black bg-gray-900">FTR (validación post-mantención)</option>

                                                    {ETAPAS_CURSO.map((etapa) => (
                                                        <optgroup key={etapa.id} label={`--- ${etapa.nombre.toUpperCase()} ---`} className="bg-gray-900 text-blue-400 font-bold">
                                                            {etapa.misiones.map(m => (
                                                                <option key={m} value={m} className="text-white font-normal">{m}</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                    
                                                    <option value="Otra" className="text-yellow-400 font-bold">OTRO (Especificar...)</option>
                                                </select>
                                                
                                                {isCustomMision && (
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ej: FERRY, VIP..." 
                                                        value={formVuelo.data.mision} 
                                                        onChange={e => {
                                                            const nuevoValor = e.target.value.toUpperCase();
                                                            // Si escriben a mano una misión de simulador, también se asigna automáticamente
                                                            if (nuevoValor.startsWith('S') || nuevoValor.includes('SIM')) {
                                                                formVuelo.setData(prev => ({ ...prev, mision: nuevoValor, aeronave: 'SIM' }));
                                                            } else {
                                                                formVuelo.setData('mision', nuevoValor);
                                                            }
                                                        }} 
                                                        className={`${inputStyle} w-2/3 mt-0 uppercase`} 
                                                        required
                                                        autoFocus
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2 p-4 bg-gray-900/40 border border-gray-700/60 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2 text-[11px] font-bold uppercase tracking-widest text-blue-400 border-b border-gray-700/50 pb-1">Dotación de Vuelo</div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Instructor</label>
                                                <select value={formVuelo.data.instructor_id} onChange={e => formVuelo.setData('instructor_id', e.target.value)} className={inputStyle}>
                                                    <option value="" className="text-yellow-400">— Vuelo Solo (sin instructor) —</option>
                                                    {instructores.map(inst => (
                                                        <option key={inst.id} value={inst.id} className="text-white">
                                                            {inst.nombre_combate || inst.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Alumno</label>
                                                <select value={formVuelo.data.alumno_id} onChange={e => formVuelo.setData('alumno_id', e.target.value)} className={inputStyle}>
                                                    <option value="" className="text-yellow-400">— Vuelo Solo (sin alumno) —</option>
                                                    {alumnos.map(alum => (<option key={alum.id} value={alum.id} className="text-white">{alum.nombre}</option>))}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-purple-400">Instructor Validador (habilitación, opcional)</label>
                                                <select value={formVuelo.data.instructor_validador_id} onChange={e => formVuelo.setData('instructor_validador_id', e.target.value)} className={inputStyle}>
                                                    <option value="" className="text-gray-500">— No aplica —</option>
                                                    {instructores.filter(inst => String(inst.id) !== String(formVuelo.data.instructor_id)).map(inst => (
                                                        <option key={inst.id} value={inst.id} className="text-white">
                                                            {inst.nombre_combate || inst.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-gray-500 mt-1">Usar solo cuando este vuelo es una habilitación: el Instructor de arriba está siendo evaluado por este instructor validador.</p>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-green-400 mb-1">Zona de Vuelo</label>
                                            
                                            {formVuelo.data.aeronave === 'SIM' ? (
                                                <div className="bg-gray-900/60 border border-gray-700/50 text-gray-500 rounded-md px-3 py-2.5 text-sm font-medium italic cursor-not-allowed text-center">
                                                    No aplica para sesiones de Simulador
                                                </div>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <select 
                                                        value={isCustomZona ? 'Otra' : (formVuelo.data.nota || '')} 
                                                        onChange={(e) => {
                                                            if (e.target.value === 'Otra') {
                                                                setIsCustomZona(true);
                                                                formVuelo.setData('nota', '');
                                                            } else {
                                                                setIsCustomZona(false);
                                                                formVuelo.setData('nota', e.target.value);
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
                                            )}
                                        </div>
                                    </div>
                                    {/* MENSAJE DE ERROR DE VALIDACIÓN */}
                                    {errorValidacion && (
                                        <div className="bg-red-500/10 border border-red-500/50 rounded-md p-3 mt-4">
                                            <p className="text-red-400 text-xs font-bold text-center tracking-wide">{errorValidacion}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/60 mt-4">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white">Cancelar</button>
                                        <button type="submit" disabled={formVuelo.processing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase py-2 px-5 rounded-md shadow-lg">{editingVuelo ? 'Guardar Cambios' : 'Anotar en Pizarra'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL 2: NOVEDADES CON PESTAÑAS */}
                    {isNovedadesModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-800 border border-gray-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
                                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center shrink-0">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Asignar Novedades Generales</h3>
                                    <button onClick={() => setIsNovedadesModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold focus:outline-none">&times;</button>
                                </div>
                                
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

                                        {/* 4. PESTAÑA: GENERAL (PILOTO DE SERVICIO Y ACTIVIDADES) */}
                                        {activeTabNovedades === 'general' && (
                                            <div className="grid grid-cols-1 gap-4 animate-fade-in">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">Piloto de Servicio</label>
                                                    <textarea placeholder="Asignación..." value={formNovedades.data.piloto_servicio} onChange={e => formNovedades.setData('piloto_servicio', e.target.value)} className={textareaStyle + " h-14"} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">Actividades de la Jornada</label>
                                                    <textarea placeholder="Ej: 08:00 - Briefing General" value={formNovedades.data.actividades} onChange={e => formNovedades.setData('actividades', e.target.value)} className={textareaStyle + " h-24"} />
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