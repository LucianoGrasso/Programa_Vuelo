import { useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import { Link } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // SOLUCIÓN: Usamos el pathname nativo del navegador para saber qué pestaña marcar como activa
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isPizarraActive = currentPath === '/pizarra';
    const isHistorialActive = currentPath === '/historial';
    const isInstructoresActive = currentPath.startsWith('/instructores');
    const isAlumnosActive = currentPath.startsWith('/alumnos');

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <nav className="bg-gray-800 border-b border-gray-700 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            {/* LOGO */}
                            <div className="shrink-0 flex items-center">
                                <Link href="/pizarra">
                                    <img src="/images/LogoPC7.png" alt="Logo PC-7" className="h-12 w-auto object-contain hover:scale-105 transition-transform" />
                                </Link>
                            </div>

                            {/* PESTAÑAS (ESCRITORIO) */}
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link href={route('pizarra.index')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-xs font-bold tracking-widest uppercase transition-colors duration-150 ${isPizarraActive ? 'border-blue-400 text-blue-400 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>
                                    Pizarra
                                </Link>
                                <Link href={route('pizarra.historial')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-xs font-bold tracking-widest uppercase transition-colors duration-150 ${isHistorialActive ? 'border-blue-400 text-blue-400 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>
                                    Historial
                                </Link>
                                <Link href={route('instructores.index')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-xs font-bold tracking-widest uppercase transition-colors duration-150 ${isInstructoresActive ? 'border-blue-400 text-blue-400 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>
                                    Instructores
                                </Link>
                                <Link href={route('alumnos.index')} className={`inline-flex items-center px-1 pt-1 border-b-2 text-xs font-bold tracking-widest uppercase transition-colors duration-150 ${isAlumnosActive ? 'border-blue-400 text-blue-400 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>
                                    Alumnos
                                </Link>
                            </div>
                        </div>

                        {/* MENÚ PILOTO / OPERADOR (DERECHA) */}
                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="ml-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button type="button" className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-800 hover:text-white focus:outline-none transition ease-in-out duration-150">
                                                {user.name}
                                                <svg className="ml-2 -mr-0.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">Cerrar Sesión</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* BOTÓN MÓVIL */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button onClick={() => setShowingNavigationDropdown((prev) => !prev)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none transition duration-150">
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* MENÚ DESPLEGABLE (MÓVIL) */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <Link href={route('pizarra.index')} className={`block w-full ps-3 pr-4 py-2 border-l-4 text-left text-sm font-bold uppercase tracking-wider ${isPizarraActive ? 'border-blue-400 bg-blue-500/10 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}>
                            Pizarra
                        </Link>
                        <Link href={route('pizarra.historial')} className={`block w-full ps-3 pr-4 py-2 border-l-4 text-left text-sm font-bold uppercase tracking-wider ${isHistorialActive ? 'border-blue-400 bg-blue-500/10 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}>
                            Historial
                        </Link>
                        <Link href={route('instructores.index')} className={`block w-full ps-3 pr-4 py-2 border-l-4 text-left text-sm font-bold uppercase tracking-wider ${isInstructoresActive ? 'border-blue-400 bg-blue-500/10 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}>
                            Instructores
                        </Link>
                        <Link href={route('alumnos.index')} className={`block w-full ps-3 pr-4 py-2 border-l-4 text-left text-sm font-bold uppercase tracking-wider ${isAlumnosActive ? 'border-blue-400 bg-blue-500/10 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}>
                            Alumnos
                        </Link>
                    </div>
                    <div className="pt-4 pb-1 border-t border-gray-700">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-200">{user.name}</div>
                            <div className="font-medium text-sm text-gray-500">{user.email}</div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <Link method="post" href={route('logout')} as="button" className="block w-full ps-3 pr-4 py-2 border-l-4 border-transparent text-left text-sm font-bold uppercase tracking-wider text-red-400 hover:bg-gray-700">
                                Cerrar Sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}