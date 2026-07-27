import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Estilo unificado de alta visibilidad para las cajas de texto (Intacto)
    const inputStyle = "mt-1 block w-full bg-gray-900/90 border border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-md p-2.5 transition-all text-sm";

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión" />

            {/* Título más discreto y elegante */}
            <h2 className="text-center text-gray-300 text-base sm:text-lg font-medium mb-3">
                Programa de vuelos de la Escuela de Aviación Naval
            </h2>


            {status && (
                <div className="mb-4 text-sm font-medium text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Campo Email */}
                <div>
                    <InputLabel htmlFor="email" value="Correo Electrónico" className="text-red-400 font-semibold text-sm tracking-wide" />
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={inputStyle}
                        autoComplete="username"
                        required
                        placeholder="ejemplo@escuela.cl"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2 text-xs text-red-400 font-medium" />
                </div>

                {/* Campo Password */}
                <div>
                    <InputLabel htmlFor="password" value="Contraseña" className="text-red-400 font-semibold text-sm tracking-wide" />
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className={inputStyle}
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2 text-xs text-red-400 font-medium" />
                </div>

                {/* Checkbox Recordarme */}
                <div className="block">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="bg-gray-900 border-gray-600 text-blue-600 focus:ring-blue-500/30 rounded"
                        />
                        <span className="ms-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">Recordarme en este equipo</span>
                    </label>
                </div>

                {/* Acciones y Botones Principales */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/60">
                    <Link
                        href={route('register')}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/50 hover:decoration-blue-400 transition-colors"
                    >
                        Crear nuevo usuario
                    </Link>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-md transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}