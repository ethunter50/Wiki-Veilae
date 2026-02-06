import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import {
    Plus,
    Book,
    LifeBuoy,
    ArrowRight,
    FileText,
    Clock,
    Sparkles,
    Search,
    Fingerprint
} from 'lucide-react';

const UserDashboard = ({ user }: { user: any }) => {
    const navigate = useNavigate();
    const [recentPages, setRecentPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bonjour');
        else if (hour < 18) setGreeting('Bon après-midi');
        else setGreeting('Bonsoir');

        const fetchRecent = async () => {
            try {
                const res = await api.get('/pages');
                // Assuming the API returns pages sorted by updated_at desc, or we sort them here
                // The controller currently does: Page::orderBy('updated_at', 'desc')->get()
                setRecentPages(res.data.slice(0, 5));
            } catch (err) {
                console.error('Failed to fetch pages', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecent();
    }, []);

    return (
        <div className="max-w-6xl mx-auto py-16 px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <header className="relative mb-20">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                <div className="absolute top-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl -z-10" />

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900/30 dark:to-[#1e1e1e] border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-sm">
                        <Sparkles size={20} />
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Espace Personnel</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-black text-[#37352f] dark:text-[#ebebeb] mb-4 tracking-tight leading-tight">
                            {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">{user.username}</span>.
                        </h1>
                        <p className="text-xl text-[#91918e] font-medium max-w-2xl leading-relaxed">
                            Prêt à explorer, créer et organiser vos connaissances aujourd'hui ?
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Left Column: Actions */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(user.role === 'admin' || user.role === 'documentaliste') && (
                            <QuickActionCard
                                icon={<Plus className="text-white" />}
                                iconBg="bg-indigo-600"
                                title="Nouvelle Page"
                                description="Commencez un nouveau document."
                                onClick={() => navigate('/admin/pages/create')}
                                delay="0"
                            />
                        )}
                        <QuickActionCard
                            icon={<Search className="text-white" />}
                            iconBg="bg-gray-900 dark:bg-gray-700"
                            title="Rechercher"
                            description="Trouvez une info rapidement."
                            onClick={() => { }} // Focus search logic if implemented
                            delay="100"
                        />
                    </div>

                    {/* Admin Banner */}
                    {user.role === 'admin' && (
                        <div className="relative overflow-hidden rounded-3xl bg-black dark:bg-[#202020] text-white p-8 shadow-2xl shadow-indigo-900/20 group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => navigate('/admin')}>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12 group-hover:rotate-45 transition-all duration-700">
                                <Fingerprint size={200} />
                            </div>

                            <div className="relative z-10 flex items-start justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-4 border border-white/10">
                                        <LifeBuoy size={12} />
                                        Administration
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Centre de Contrôle</h2>
                                    <p className="text-indigo-100 text-sm max-w-md mb-6">Gérez les utilisateurs, la structure du wiki et les paramètres globaux.</p>

                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        Accéder
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column: Recent Activity */}
                <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-200`}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-[#37352f] dark:text-[#ebebeb]">
                            <Clock size={18} className="text-indigo-500" />
                            Récemment mis à jour
                        </h2>
                    </div>

                    <div className="flex flex-col gap-3">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-[#252525] animate-pulse" />
                            ))
                        ) : recentPages.length > 0 ? (
                            recentPages.map((page, i) => (
                                <RecentItemCard key={page.id} page={page} index={i} onClick={() => navigate(`/pages/${page.slug}`)} />
                            ))
                        ) : (
                            <div className="p-8 text-center bg-gray-50 dark:bg-[#202020] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                <FileText className="mx-auto text-gray-300 mb-2" size={24} />
                                <p className="text-sm text-gray-500">Aucune activité récente</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20">
                        <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Le saviez-vous ?</h3>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                            Vous pouvez organiser vos pages et catégories en les glissant-déposant depuis l'interface de gestion globale !
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

const QuickActionCard = ({ icon, iconBg, title, description, onClick, delay }: any) => (
    <button
        onClick={onClick}
        className="w-full p-6 text-left rounded-3xl bg-white dark:bg-[#202020] border border-[#ececeb] dark:border-[#2f2f2f] hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all group overflow-hidden relative"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-1 text-[#37352f] dark:text-[#ebebeb]">{title}</h3>
        <p className="text-sm text-[#91918e] group-hover:text-[#37352f] dark:group-hover:text-[#bcbcb9] transition-colors">{description}</p>

        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
            <ArrowRight size={20} className="text-indigo-400" />
        </div>
    </button>
);

const RecentItemCard = ({ page, onClick, index }: any) => (
    <div
        onClick={onClick}
        className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#202020] border border-transparent hover:border-[#ececeb] dark:hover:border-[#353535] hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-none transition-all cursor-pointer group"
        style={{ animationDelay: `${index * 50}ms` }}
    >
        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] flex items-center justify-center text-[#91918e] group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-colors">
            <Book size={18} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-[#37352f] dark:text-[#ebebeb] truncate mb-0.5 group-hover:text-indigo-600 transition-colors">{page.title}</h4>
            <div className="flex items-center gap-2 text-[10px] text-[#91918e]">
                <span>Mis à jour {new Date(page.updated_at).toLocaleDateString()}</span>
            </div>
        </div>
        <ArrowRight size={14} className="text-[#91918e] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
    </div>
);

export default UserDashboard;
