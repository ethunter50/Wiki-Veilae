import { useState, useEffect } from 'react';
import api from '../lib/axios';
import {
    UserPlus,
    Trash2,
    Edit2,
    Shield,
    User,
    X,
    Save,
    Loader2,
    ChevronLeft
} from 'lucide-react';

interface UserData {
    id: number;
    username: string;
    role: 'admin' | 'user' | 'documentaliste';
}

interface UsersManagerProps {
    onBack: () => void;
}

const UsersManager = ({ onBack }: UsersManagerProps) => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'user' as 'admin' | 'user' | 'documentaliste'
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user: UserData | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '',
                role: user.role
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                role: 'user'
            });
        }
        setFormError('');
        setIsModalOpen(true);
    };

    const handleDelete = async (user: UserData) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.username} ?`)) return;

        try {
            await api.delete(`/users/${user.id}`);
            setUsers(users.filter(u => u.id !== user.id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        try {
            if (editingUser) {
                const response = await api.put(`/users/${editingUser.id}`, formData);
                setUsers(users.map(u => u.id === editingUser.id ? response.data.user : u));
            } else {
                const response = await api.post('/users', formData);
                setUsers([...users, response.data.user]);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors text-[#91918e]"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#37352f] dark:text-[#ebebeb]">Gestion des utilisateurs</h1>
                        <p className="text-[#91918e]">Créez, modifiez ou supprimez les accès au Wiki.</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                    <UserPlus size={18} />
                    Nouvel utilisateur
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="bg-white dark:bg-[#202020] rounded-xl border border-[#ececeb] dark:border-[#2f2f2f] overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f7f7f5] dark:bg-[#252525] border-b border-[#ececeb] dark:border-[#2f2f2f]">
                                <th className="px-6 py-4 text-xs font-semibold text-[#91918e] uppercase tracking-wider">Pseudo</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[#91918e] uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[#91918e] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ececeb] dark:divide-[#2f2f2f]">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-[#fbfbfa] dark:hover:bg-[#252525] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'admin' ? 'bg-indigo-600' : 'bg-green-600'}`}>
                                                {user.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="font-semibold text-[#37352f] dark:text-[#ebebeb]">@{user.username}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                            : user.role === 'documentaliste'
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                            {user.role === 'admin' ? <Shield size={12} /> : user.role === 'documentaliste' ? <Edit2 size={12} /> : <User size={12} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(user)}
                                                className="p-2 text-[#91918e] hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="p-2 text-[#91918e] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#202020] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#ececeb] dark:border-[#2f2f2f] animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-[#ececeb] dark:border-[#2f2f2f] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#37352f] dark:text-[#ebebeb]">
                                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] rounded-lg transition-colors text-[#91918e]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-[#91918e] uppercase mb-1.5 ml-1">Pseudo (Username)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#f7f7f5] dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                                    placeholder="jdupont"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#91918e] uppercase mb-1.5 ml-1">Rôle</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' | 'documentaliste' })}
                                    className="w-full px-4 py-2 bg-[#f7f7f5] dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white appearance-none"
                                >
                                    <option value="user">Utilisateur</option>
                                    <option value="documentaliste">Documentaliste</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#91918e] uppercase mb-1.5 ml-1">
                                    Mot de passe {editingUser && '(laisser vide pour ne pas changer)'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#f7f7f5] dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-[#2f2f2f] hover:bg-gray-200 dark:hover:bg-[#353535] text-[#37352f] dark:text-[#ebebeb] font-semibold rounded-xl transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManager;
