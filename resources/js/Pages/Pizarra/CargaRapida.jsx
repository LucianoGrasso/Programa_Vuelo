import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

const ETAPAS_CURSO = [
    { id: 'pre_solo', nombre: 'Pre Solo', misiones: ['SPS-1D', 'PS-1D', 'SPS-2D', 'PS-2D', 'PS-3D', 'SPS-3D', 'PS-4D', 'PS-5D', 'SPS-4D', 'PS-6D', 'PS-7D', 'PS-8D', 'PS-9D', 'SPS-5D', 'PS-10D', 'PS-11D', 'PS-12D', 'PS-13D', 'PS-14D', 'PS-15D', 'PS-16D', 'PS-17DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'precision', nombre: 'Precisión', misiones: ['SP-1D', 'P-1D', 'P-2S', 'P-3D', 'P-4S', 'P-5D', 'P-6S', 'P-7D', 'P-8S', 'P-9D', 'P-10S', 'P-11D', 'P-12DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'acrobacias', nombre: 'Acrobacias', misiones: ['A-1D', 'A-2D', 'A-3D', 'A-4S', 'A-5D', 'A-6S', 'A-7D', 'A-8S', 'A-9D', 'A-10DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'navegacion', nombre: 'Navegación', misiones: ['SNV-1D', 'NV-1D', 'NV-2D', 'NV-3D', 'NV-4D', 'NV-5D', 'NV-6DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'instrumentos_basicos', nombre: 'Inst. Básicos', misiones: ['SIB-1D', 'IB-1D', 'SIB-2D', 'IB-2D', 'SIB-3D', 'IB-3D', 'SIB-4D', 'IB-4D', 'SIB-5D', 'IB-5D', 'SIB-6D', 'IB-6DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'radio_instrumento', nombre: 'Radio Inst.', misiones: ['SRI-1D', 'RI-1D', 'SRI-2D', 'RI-2D', 'SRI-3D', 'RI-3D', 'SRI-4D', 'RI-4D', 'SRI-5D', 'RI-5D', 'SRI-6D', 'RI-6D', 'SRI-7D', 'RI-7D', 'SRI-8D', 'RI-8D', 'SRI-9D', 'RI-9D', 'RI-10D', 'RI-11D', 'RI-12D', 'RI-13D', 'RI-14D', 'RI-15D', 'RI-16DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'formacion', nombre: 'Formación', misiones: ['F-1D', 'F-2D', 'F-3D', 'F-4D', 'F-5D', 'F-6D', 'F-7D', 'F-8DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] },
    { id: 'nocturno', nombre: 'Nocturno', misiones: ['N-1D', 'N-2D', 'N-3D', 'N-4DX', 'EX REP 1', 'EX REP 2', 'EX REP 3', 'EX REP 4'] }
];

const inputStyle = "block w-full bg-gray-950 border border-gray-600 text-white rounded-md shadow-sm px-2 py-1.5 text-xs focus:ring-blue-500 focus:border-blue-500";

const filaVacia = () => ({ instructor_id: '', nota: '', fecha: '', calificacion: '' });

export default function CargaRapida({ auth, alumnos, instructores }) {
    const [alumnoId, setAlumnoId] = useState('');
    const [etapaId, setEtapaId] = useState(ETAPAS_CURSO[0].id);
    const [filas, setFilas] = useState({});
    const [processing, setProcessing] = useState(false);
    const [mensaje, setMensaje] = useState('');

    const etapaActual = ETAPAS_CURSO.find(e => e.id === etapaId);

    const filaDe = (mision) => filas[mision] || filaVacia();

    const actualizarFila = (mision, campo, valor) => {
        setFilas(prev => ({
            ...prev,
            [mision]: { ...filaDe(mision), [campo]: valor }
        }));
        setMensaje('');
    };

    const cambiarEtapa = (id) => {
        setEtapaId(id);
        setFilas({});
        setMensaje('');
    };

    const handleGuardarTodo = (e) => {
        e.preventDefault();

        if (!alumnoId) {
            setMensaje('Seleccioná primero el alumno.');
            return;
        }

        // Solo se manda al servidor lo que realmente se completó: una fila cuenta
        // como "cargada" cuando tiene instructor, fecha y calificación.
        const vuelos = etapaActual.misiones
            .filter(mision => {
                const f = filaDe(mision);
                return f.instructor_id && f.fecha && f.calificacion;
            })
            .map(mision => {
                const f = filaDe(mision);
                return {
                    mision,
                    alumno_id: alumnoId,
                    instructor_id: f.instructor_id,
                    nota: f.nota,
                    fecha: f.fecha,
                    calificacion: f.calificacion,
                };
            });

        if (vuelos.length === 0) {
            setMensaje('No hay ninguna fila completa para guardar (falta instructor, fecha o calificación).');
            return;
        }

        setProcessing(true);
        router.post(route('pizarra.storeBulk'), { vuelos }, {
            preserveScroll: true,
            onSuccess: () => {
                setFilas({});
                setMensaje(`Se guardaron ${vuelos.length} evaluaciones de "${etapaActual.nombre}".`);
            },
            onError: () => setMensaje('Hubo un error al guardar. Revisá los datos e intentá de nuevo.'),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Carga Rápida de Evaluaciones" />

            <div className="py-8 bg-gray-950 min-h-screen">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    <div className="border-b border-gray-800 pb-4">
                        <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Carga Rápida de Evaluaciones</h1>
                        <p className="text-sm text-gray-400 mt-1">Pensada para traspasar de una sola vez el historial de un pizarrón físico: elegí alumno y etapa, completá las filas que correspondan y guardá todo junto.</p>
                    </div>

                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">Alumno</label>
                            <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)} className={inputStyle + " py-2.5"}>
                                <option value="" disabled>Seleccione Alumno</option>
                                {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">Etapa</label>
                            <select value={etapaId} onChange={e => cambiarEtapa(e.target.value)} className={inputStyle + " py-2.5"}>
                                {ETAPAS_CURSO.map(et => <option key={et.id} value={et.id}>{et.nombre}</option>)}
                            </select>
                        </div>
                    </div>

                    {!alumnoId ? (
                        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 text-center text-sm text-gray-500 italic">
                            Elegí un alumno arriba para empezar a cargar sus misiones de "{etapaActual.nombre}".
                        </div>
                    ) : (
                        <form onSubmit={handleGuardarTodo} className="space-y-4">
                            <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-900/40">
                                            <tr>
                                                <th className="px-3 py-3 text-left text-[10px] font-bold text-blue-400 uppercase tracking-wider w-24">Misión</th>
                                                <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instructor</th>
                                                <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider w-28">Zona</th>
                                                <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider w-40">Fecha</th>
                                                <th className="px-3 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider w-44">Calificación</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700/60">
                                            {etapaActual.misiones.map(mision => {
                                                const f = filaDe(mision);
                                                return (
                                                    <tr key={mision} className="even:bg-gray-800/40 hover:bg-gray-700/30">
                                                        <td className="px-3 py-2 text-xs font-bold text-gray-200 whitespace-nowrap">{mision}</td>
                                                        <td className="px-3 py-2">
                                                            <select value={f.instructor_id} onChange={e => actualizarFila(mision, 'instructor_id', e.target.value)} className={inputStyle}>
                                                                <option value="">—</option>
                                                                {instructores.map(inst => (
                                                                    <option key={inst.id} value={inst.id}>{inst.nombre_combate || inst.nombre}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input type="text" placeholder="Ej: R-1" value={f.nota} onChange={e => actualizarFila(mision, 'nota', e.target.value)} className={inputStyle} />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input type="date" value={f.fecha} onChange={e => actualizarFila(mision, 'fecha', e.target.value)} className={inputStyle} style={{ colorScheme: 'dark' }} />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <select value={f.calificacion} onChange={e => actualizarFila(mision, 'calificacion', e.target.value)} className={inputStyle}>
                                                                <option value="">—</option>
                                                                <option value="aprobado">Aprobado</option>
                                                                <option value="reprobado">Reprobado</option>
                                                                <option value="pendiente">Pendiente</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {mensaje && (
                                <div className="bg-gray-800 border border-gray-700 rounded-md p-3">
                                    <p className="text-xs font-bold text-blue-400">{mensaje}</p>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-md shadow-lg disabled:opacity-50">
                                    Guardar Todo
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
