import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

const ETAPAS_CURSO = [
    { 
        id: 'pre_solo', 
        nombre: 'Pre Solo', 
        misiones: [
            'SPS-1D', 'PS-1D', 'SPS-2D', 'PS-2D', 'PS-3D', 'SPS-3D', 'PS-4D', 'PS-5D', 
            'SPS-4D', 'PS-6D', 'PS-7D', 'PS-8D', 'PS-9D', 'SPS-5D', 'PS-10D', 'PS-11D', 
            'PS-12D', 'PS-13D', 'PS-14D', 'PS-15D', 'PS-16D', 'PS-17DX', 
            'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'
        ] 
    },
    { 
        id: 'precision', 
        nombre: 'Precisión', 
        misiones: [
            'SP-1D', 'P-1D', 'P-2S', 'P-3D', 'P-4S', 'P-5D', 'P-6S', 'P-7D', 'P-8S', 
            'P-9D', 'P-10S', 'P-11D', 'P-12DX', 
            'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'
        ] 
    },
    { 
        id: 'acrobacias', 
        nombre: 'Acrobacias', 
        misiones: [
            'A-1D', 'A-2D', 'A-3D', 'A-4S', 'A-5D', 'A-6S', 'A-7D', 'A-8S', 'A-9D', 'A-10DX',
            'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'
        ] 
    },
    { 
        id: 'navegacion', 
        nombre: 'Navegación', 
        misiones: [
            'SNV-1D', 'NV-1D', 'NV-2D', 'NV-3D', 'NV-4D', 'NV-5D', 'NV-6DX',
            'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'
        ] 
    },
    { 
        id: 'instrumentos_basicos', 
        nombre: 'Inst. Básicos', 
        misiones: [
            'SIB-1D', 'IB-1D', 'SIB-2D', 'IB-2D', 'SIB-3D', 'IB-3D', 'SIB-4D', 'IB-4D', 
            'SIB-5D', 'IB-5D', 'SIB-6D', 'IB-6DX', 
            'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'
        ] 
    },
    { 
        id: 'radio_instrumento', 
        nombre: 'Radio Inst.', 
        misiones: [
            'SRI-1D', 'RI-1D', 'SRI-2D', 'RI-2D', 'SRI-3D', 'RI-3D', 'SRI-4D', 'RI-4D', 
            'SRI-5D', 'RI-5D', 'SRI-6D', 'RI-6D', 'SRI-7D', 'RI-7D', 'SRI-8D', 'RI-8D', 
            'SRI-9D', 'RI-9D', 'RI-10D', 'RI-11D', 'RI-12D', 'RI-13D', 'RI-14D', 'RI-15D', 'RI-16DX',
            'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'
        ] 
    },
    { 
        id: 'formacion', 
        nombre: 'Formación', 
        misiones: [
            'F-1D', 'F-2D', 'F-3D', 'F-4D', 'F-5D', 'F-6D', 'F-7D', 'F-8DX',
            'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'
        ] 
    },
    { 
        id: 'nocturno', 
        nombre: 'Nocturno', 
        misiones: [
            'N-1D', 'N-2D', 'N-3D', 'N-4DX',
            'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'
        ] 
    }
];

const inputStyle = "mt-1 block w-full bg-gray-950 border border-gray-600 text-white rounded-md shadow-sm px-3 py-2 text-xs focus:ring-blue-500 focus:border-blue-500";

// COMPONENTE CELDA REFINADO: Cambia de color según la calificación
const CeldaProgreso = ({ vuelo }) => {
    if (!vuelo) return <div className="w-14 h-14 bg-gray-900/30 border border-gray-700/30 rounded flex items-center justify-center opacity-40"><span className="text-gray-600 text-xs">-</span></div>;

    const [year, month, day] = vuelo.fecha.split('-');
    const zona = vuelo.nota || '-';
    const numInstructor = vuelo.instructor?.numero || '-'; 
    const isAprobado = vuelo.calificacion === 'aprobado';
    const isReprobado = vuelo.calificacion === 'reprobado';

    // Colores dinámicos
    const borderColor = isAprobado ? 'border-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.3)]' : (isReprobado ? 'border-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'border-gray-500');
    const crossColor = isAprobado ? 'bg-blue-500/30' : (isReprobado ? 'bg-red-500/30' : 'bg-gray-500/50');
    const dataColor = isAprobado ? 'text-blue-300' : (isReprobado ? 'text-red-400' : 'text-gray-300');
    const zonaColor = isAprobado ? 'text-blue-400' : (isReprobado ? 'text-red-500' : 'text-green-400');

    return (
        <div className={`relative w-14 h-14 bg-gray-800 border ${borderColor} rounded flex items-center justify-center font-mono text-[10px] font-bold mx-auto transition-transform hover:scale-110 cursor-default`}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-full h-[1px] ${crossColor}`}></div>
                <div className={`absolute h-full w-[1px] ${crossColor}`}></div>
            </div>
            <div className={`absolute top-0.5 w-full text-center tracking-tighter truncate px-1 ${zonaColor}`} title={zona}>{zona}</div>
            <div className={`absolute left-1 top-1/2 -translate-y-1/2 ${dataColor}`}>{numInstructor}</div>
            <div className={`absolute right-1 top-1/2 -translate-y-1/2 ${dataColor}`}>{month}</div>
            <div className={`absolute bottom-0.5 w-full text-center ${dataColor}`}>{day}</div>
        </div>
    );
};

export default function Evaluaciones({ auth, alumnos }) {
    const [activeTab, setActiveTab] = useState(ETAPAS_CURSO[0].id);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const etapaActual = ETAPAS_CURSO.find(e => e.id === activeTab);

    // Formulario para ingreso manual directo a la matriz
    const formManual = useForm({
        fecha: new Date().toISOString().split('T')[0],
        aeronave: 'SIMULADOR', // Valor por defecto o irrelevante para este caso
        etd: '00:00', eta: '01:00',
        mision: '', instructor_id: '', alumno_id: '', nota: '',
        estado_progreso: 'arribado', // Lo forzamos a arribado
        calificacion: 'aprobado'
    });

    // Extraemos instructores únicos desde los vuelos para el selector manual (o idealmente pasarlos desde el backend)
    const instructoresUnicos = [];
    alumnos.forEach(a => a.vuelos.forEach(v => {
        if(v.instructor && !instructoresUnicos.find(i => i.id === v.instructor.id)) instructoresUnicos.push(v.instructor);
    }));

    const handleManualSubmit = (e) => {
        e.preventDefault();
        router.post(route('pizarra.store'), formManual.data, {
            onSuccess: () => { formManual.reset('mision', 'instructor_id', 'alumno_id', 'nota'); setIsManualModalOpen(false); }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Matriz de Evaluaciones" />

            <div className="py-8 bg-gray-950 min-h-screen">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Progresión de Vuelo</h1>
                            <p className="text-sm text-gray-400 mt-1">Matriz de evaluaciones por etapa y alumno</p>
                        </div>
                        <button onClick={() => setIsManualModalOpen(true)} className="bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200 font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-md transition-all active:scale-95 shadow-lg">
                            + Agregar Evaluación Manual
                        </button>
                    </div>

                    <div className="flex overflow-x-auto border-b border-gray-800 custom-scrollbar pb-1">
                        {ETAPAS_CURSO.map((etapa) => (
                            <button
                                key={etapa.id}
                                onClick={() => setActiveTab(etapa.id)}
                                className={`whitespace-nowrap py-3 px-6 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                                    activeTab === etapa.id ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                                }`}
                            >
                                {etapa.nombre}
                            </button>
                        ))}
                    </div>

                    {/* MATRIZ DE EVALUACIONES (ESTANDARIZADA) */}
                    <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700 flex flex-col animate-fade-in">
                        <div className="px-4 py-3 bg-gray-700/60 border-b border-gray-600 flex justify-between items-center">
                            <span className="text-sm font-bold uppercase tracking-widest text-white capitalize">
                                Matriz de Progresión - {etapaActual.nombre}
                            </span>
                            <span className="text-[10px] bg-gray-900 text-gray-300 font-mono px-2 py-1 rounded border border-gray-600">
                                {alumnos.length} Alumnos
                            </span>
                        </div>

                        <div className="overflow-x-auto flex-grow">
                            <table className="min-w-full divide-y divide-gray-700 text-center">
                                <thead className="bg-gray-900/40">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest sticky left-0 bg-gray-900/95 border-r border-gray-700 z-10 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                            Alumno
                                        </th>
                                        {etapaActual.misiones.map((mision) => (
                                            <th key={mision} className="px-2 py-4 text-center text-xs font-bold text-blue-400 uppercase tracking-widest min-w-[80px]">
                                                {mision}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/60 bg-gray-800/20">
                                    {alumnos.map((alumno) => (
                                        <tr key={alumno.id} className="hover:bg-gray-700/40 transition-colors even:bg-gray-800/40">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-200 sticky left-0 bg-gray-800 border-r border-gray-700 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                                {alumno.nombre}
                                            </td>
                                            {etapaActual.misiones.map((mision) => {
                                                const vueloAsignado = alumno.vuelos.find(v => v.mision.toUpperCase() === mision.toUpperCase());
                                                return (
                                                    <td key={mision} className="px-2 py-3 whitespace-nowrap text-center border-r border-gray-700/30 last:border-0">
                                                        <CeldaProgreso vuelo={vueloAsignado} />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {alumnos.length === 0 && (
                                        <tr>
                                            <td colSpan={etapaActual.misiones.length + 1} className="px-6 py-8 text-center text-sm text-gray-500 italic">
                                                No hay alumnos activos registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* LEYENDA DEL CUADRANTE */}
                        <div className="bg-gray-900/60 p-4 border-t border-gray-700 flex flex-wrap items-center justify-center gap-6 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                            <span className="text-gray-500">Leyenda de Celda:</span>
                            <div className="flex items-center gap-2"><span className="text-green-400">Arriba:</span> Zona</div>
                            <div className="flex items-center gap-2"><span className="text-blue-400">Izq:</span> N° Inst.</div>
                            <div className="flex items-center gap-2"><span className="text-gray-300">Der:</span> Mes</div>
                            <div className="flex items-center gap-2"><span className="text-gray-300">Abajo:</span> Día</div>
                            <div className="ml-4 flex gap-4 border-l border-gray-700 pl-4">
                                <div className="flex items-center gap-1"><span className="w-3 h-3 border border-blue-500 bg-blue-500/20 inline-block rounded-sm"></span> Aprobado</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 border border-red-500 bg-red-500/20 inline-block rounded-sm"></span> Reprobado</div>
                            </div>
                        </div>
                    </div>

                    {/* MODAL MANUAL DE EVALUACIONES */}
                    {isManualModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-800 border border-gray-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
                                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Ingreso Manual de Evaluación</h3>
                                    <button onClick={() => setIsManualModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
                                </div>
                                <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold uppercase text-gray-300">Fecha</label><input type="date" value={formManual.data.fecha} onChange={e => formManual.setData('fecha', e.target.value)} className={inputStyle} required style={{ colorScheme: 'dark' }} /></div>
                                        <div><label className="block text-xs font-bold uppercase text-gray-300">Zona de Vuelo</label><input type="text" placeholder="Ej: R-1" value={formManual.data.nota} onChange={e => formManual.setData('nota', e.target.value)} className={inputStyle} required /></div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-300">Alumno</label>
                                            <select value={formManual.data.alumno_id} onChange={e => formManual.setData('alumno_id', e.target.value)} className={inputStyle} required>
                                                <option value="" disabled>Seleccione Alumno</option>
                                                {alumnos.map(alum => <option key={alum.id} value={alum.id}>{alum.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-gray-300">Instructor</label>
                                            <select value={formManual.data.instructor_id} onChange={e => formManual.setData('instructor_id', e.target.value)} className={inputStyle} required>
                                                <option value="" disabled>Seleccione Inst.</option>
                                                {instructoresUnicos.map(inst => <option key={inst.id} value={inst.id}>{inst.nombre_combate || inst.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold uppercase text-blue-400">Código de Misión (CRÍTICO)</label>
                                            <select value={formManual.data.mision} onChange={e => formManual.setData('mision', e.target.value)} className={`${inputStyle} border-blue-500/50`} required>
                                                <option value="" disabled>Seleccione Misión de la Etapa Actual</option>
                                                {etapaActual.misiones.map(mision => <option key={mision} value={mision}>{mision}</option>)}
                                            </select>
                                            <p className="text-[9px] text-gray-500 mt-1">Este código ubicará la cruz en la columna correcta.</p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">Calificación del Vuelo</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="calificacion" value="aprobado" checked={formManual.data.calificacion === 'aprobado'} onChange={e => formManual.setData('calificacion', e.target.value)} className="text-blue-500 focus:ring-blue-500" />
                                                    <span className="text-sm text-gray-300 font-bold">Aprobado</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="calificacion" value="reprobado" checked={formManual.data.calificacion === 'reprobado'} onChange={e => formManual.setData('calificacion', e.target.value)} className="text-red-500 focus:ring-red-500" />
                                                    <span className="text-sm text-gray-300 font-bold">Reprobado</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4 border-t border-gray-700/60 mt-4">
                                        <button type="submit" disabled={formManual.processing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase py-2 px-5 rounded-md shadow-lg">Registrar Cruz Manual</button>
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