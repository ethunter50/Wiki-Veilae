import { useState, useEffect } from 'react';
import api from '../lib/axios';
import {
    Users,
    ShieldCheck,
    UserPlus,
    Clock,
    ArrowRight,
    Loader2,
    Activity,
    FileText,
    LayoutGrid,
    ListTree,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminStats {
    total_users: number;
    admins_count: number;
    users_count: number;
    total_pages: number;
    latest_users: any[];
}

const AdminDashboard = ({ user }: { user: any }) => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    if (user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <ShieldCheck size={64} className="text-red-500 mb-6" />
                <h2 className="text-3xl font-bold text-[#37352f] dark:text-[#ebebeb] mb-2">Accès Non Autorisé</h2>
                <p className="text-[#91918e]">Vous n'avez pas les permissions nécessaires pour accéder à cet espace.</p>
            </div>
        );
    }


    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch admin stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 size={40} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-8 animate-in fade-in duration-500">
            <header className="mb-12">
                <h1 className="text-4xl font-bold text-[#37352f] dark:text-[#ebebeb] mb-2 flex items-center gap-3">
                    <ShieldCheck className="text-indigo-600" size={36} />
                    Centre de Contrôle Admin
                </h1>
                <p className="text-[#91918e] text-lg">Gérez les accès, surveillez l'activité et configurez le site.</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    icon={<Users className="text-blue-600" />}
                    title="Total Utilisateurs"
                    value={stats?.total_users || 0}
                    subtitle="Inscrits sur la plateforme"
                    color="blue"
                />
                <StatCard
                    icon={<ShieldCheck className="text-indigo-600" />}
                    title="Administrateurs"
                    value={stats?.admins_count || 0}
                    subtitle="Accès complet au système"
                    color="indigo"
                />
                <StatCard
                    icon={<FileText className="text-green-600" />}
                    title="Pages du Wiki"
                    value={stats?.total_pages || 0}
                    subtitle="Contenus créés"
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Management Hub */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#ececeb] dark:border-[#2f2f2f] shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-indigo-600" />
                            Actions Rapides
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {user.role === 'admin' && (
                                <Link to="/admin/users" className="group">
                                    <div className="p-5 rounded-xl border border-[#ececeb] dark:border-[#2f2f2f] hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer">
                                        <div className="flex items-center justify-between mb-2">
                                            <UserPlus className="text-indigo-600" size={24} />
                                            <ArrowRight className="text-[#91918e] group-hover:translate-x-1 transition-transform" size={18} />
                                        </div>
                                        <h3 className="font-bold text-[#37352f] dark:text-[#ebebeb]">Gérer les utilisateurs</h3>
                                        <p className="text-sm text-[#91918e]">Ajouter, modifier ou révoquer des accès.</p>
                                    </div>
                                </Link>
                            )}
                            <Link to="/admin/categories" className="group">
                                <div className="p-5 rounded-xl border border-[#ececeb] dark:border-[#2f2f2f] hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <LayoutGrid className="text-indigo-600" size={24} />
                                        <ArrowRight className="text-[#91918e] group-hover:translate-x-1 transition-transform" size={18} />
                                    </div>
                                    <h3 className="font-bold text-[#37352f] dark:text-[#ebebeb]">Gérer les catégories</h3>
                                    <p className="text-sm text-[#91918e]">Organiser l'arborescence du wiki.</p>
                                </div>
                            </Link>

                            <Link to="/admin/global" className="group">
                                <div className="p-5 rounded-xl border border-[#ececeb] dark:border-[#2f2f2f] hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <ListTree className="text-indigo-600" size={24} />
                                        <ArrowRight className="text-[#91918e] group-hover:translate-x-1 transition-transform" size={18} />
                                    </div>
                                    <h3 className="font-bold text-[#37352f] dark:text-[#ebebeb]">Organisation Globale</h3>
                                    <p className="text-sm text-[#91918e]">Gérer l'ordre des pages et catégories.</p>
                                </div>
                            </Link>

                            <Link to="/admin/settings" className="group">
                                <div className="p-5 rounded-xl border border-[#ececeb] dark:border-[#2f2f2f] hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <SettingsIcon className="text-gray-600 group-hover:text-indigo-600 transition-colors" size={24} />
                                        <ArrowRight className="text-[#91918e] group-hover:translate-x-1 transition-transform" size={18} />
                                    </div>
                                    <h3 className="font-bold text-[#37352f] dark:text-[#ebebeb]">Paramètres Système</h3>
                                    <p className="text-sm text-[#91918e]">Maintenance et configuration globale.</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar Activity - Only for Admin */}
                {user.role === 'admin' && (
                    <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#ececeb] dark:border-[#2f2f2f] shadow-sm">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-indigo-600" />
                            Derniers Inscrits
                        </h2>
                        <div className="space-y-4">
                            {stats?.latest_users.map((user: any) => (
                                <div key={user.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                                        {user.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate dark:text-[#ebebeb]">{user.username}</p>
                                        <p className="text-xs text-[#91918e]">{new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, subtitle }: any) => (
    <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl border border-[#ececeb] dark:border-[#2f2f2f] shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-gray-50 dark:bg-[#252525] rounded-xl">
                {icon}
            </div>
        </div>
        <div className="space-y-1">
            <p className="text-[#91918e] text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold dark:text-[#ebebeb]">{value}</h3>
            <p className="text-xs text-[#91918e]">{subtitle}</p>
        </div>
    </div>
);

const SettingsIcon = ({ size, className }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default AdminDashboard;
