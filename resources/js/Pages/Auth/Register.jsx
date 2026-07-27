import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Mismo estilo unificado
    const inputStyle = "mt-1 block w-full bg-gray-900/90 border border-gray-600 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-md p-2.5 transition-all text-sm";

    return (
        <GuestLayout>
            <Head title="Registro de Usuario" />

            {/* Título y Avión */}
            <h2 className="text-center text-gray-300 text-base sm:text-lg font-medium mb-3">
                Programa de vuelos de la Escuela de Aviación Naval
            </h2>
            

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nombre Completo" className="text-red-400 font-semibold text-sm tracking-wide" />
                    <input
                        id="name"
                        name="name"
                        value={data.name}
                        className={inputStyle}
                        autoComplete="name"
                        required
                        placeholder="Ej: T2 Apellido"
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError message={errors.name} className="mt-2 text-xs text-red-400 font-medium" />
                </div>

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

                <div>
                    <InputLabel htmlFor="password" value="Contraseña" className="text-red-400 font-semibold text-sm tracking-wide" />
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className={inputStyle}
                        autoComplete="new-password"
                        required
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2 text-xs text-red-400 font-medium" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" className="text-red-400 font-semibold text-sm tracking-wide" />
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className={inputStyle}
                        autoComplete="new-password"
                        required
                        placeholder="••••••••"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    <InputError message={errors.password_confirmation} className="mt-2 text-xs text-red-400 font-medium" />
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/60">
                    <Link
                        href={route('login')}
                        className="text-sm font-medium text-blue-400 hover:text-gray-300 underline underline-offset-4 decoration-gray-600 hover:decoration-gray-400 transition-colors"
                    >
                        ¿Ya tienes cuenta?
                    </Link>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-md transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Registrarse
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}