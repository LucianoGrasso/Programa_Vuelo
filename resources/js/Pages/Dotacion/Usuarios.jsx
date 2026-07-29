import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Usuarios({ auth, usuarios }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'operador',
    });

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (usuario) => {
        setEditingUser(usuario);
        setData({
            name: usuario.name,
            email: usuario.email,
            password: '',
            role: usuario.role,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            // Único campo editable en modo edición: el rol. Se manda solo
            // ese dato (no el estado completo del form) vía router.put.
            router.put(route('usuarios.update', editingUser.id), { role: data.role }, {
                preserveScroll: true,
                onSuccess: () => { reset(); setIsModalOpen(false); }
            });
        } else {
            post(route('usuarios.store'), {
                onSuccess: () => { reset(); setIsModalOpen(false); }
            });
        }
    };

    const inputStyle = "mt-1.5 block w-full bg-gray-950 border border-gray-600 text-white placeholder-gray-500 rounded-md shadow-sm px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium";

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gestión de Usuarios" />

            <div className="py-8 bg-gray-950 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Usuarios</h1>
                            <p className="text-sm text-gray-400 mt-1">Alta de cuentas y control de roles de acceso</p>
                        </div>
                        <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-md shadow-lg flex items-center justify-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            <span>Nuevo Usuario</span>
                        </button>
                    </div>

                    <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700 text-left">
                                <thead className="bg-gray-900/40">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Rol</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/60 bg-gray-800/20">
                                    {usuarios.map((usuario) => (
                                        <tr key={usuario.id} className="hover:bg-gray-700/40 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-200">
                                                {usuario.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {usuario.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${usuario.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-gray-700/50 text-gray-300 border-gray-600'}`}>
                                                    {usuario.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                                                <button onClick={() => openEditModal(usuario)} className="bg-gray-700/50 hover:bg-blue-600 text-gray-300 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all">
                                                    Cambiar Rol
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {usuarios.length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-8 text-sm text-center text-gray-500 italic">No hay usuarios registrados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                                <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">{editingUser ? `Cambiar Rol — ${editingUser.name}` : 'Alta de Usuario'}</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold focus:outline-none">&times;</button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    {!editingUser && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Nombre</label>
                                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputStyle} required />
                                                {errors.name && <p className="text-red-400 text-xs mt-2 font-bold">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Email</label>
                                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputStyle} required />
                                                {errors.email && <p className="text-red-400 text-xs mt-2 font-bold">{errors.email}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Contraseña Inicial</label>
                                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className={inputStyle} required />
                                                {errors.password && <p className="text-red-400 text-xs mt-2 font-bold">{errors.password}</p>}
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Rol</label>
                                        <select value={data.role} onChange={e => setData('role', e.target.value)} className={inputStyle}>
                                            <option value="operador">Operador</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {errors.role && <p className="text-red-400 text-xs mt-2 font-bold">{errors.role}</p>}
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/60 mt-6">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white">Cancelar</button>
                                        <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase py-2 px-5 rounded-md shadow-lg">Guardar</button>
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
