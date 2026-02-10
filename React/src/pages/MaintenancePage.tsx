import { AlertTriangle, Clock, LogOut } from 'lucide-react';

const MaintenancePage = ({ message, onLogout }: { message: string, onLogout?: () => void }) => {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#fbfbfa] dark:bg-[#191919] p-4 text-center">
            <div className="w-24 h-24 mb-8 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle size={48} className="text-amber-500" />
            </div>

            <h1 className="text-4xl font-black text-[#37352f] dark:text-[#ebebeb] mb-4">
                Maintenance en cours
            </h1>

            <p className="text-xl text-[#91918e] max-w-lg mb-8 leading-relaxed">
                {message || "Nous effectuons une mise à jour importante de la plateforme. Nous serons de retour très vite."}
            </p>

            <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-[#91918e] opacity-70">
                    <Clock size={16} />
                    <span>Merci de votre patience</span>
                </div>

                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#252525] rounded-xl text-sm font-semibold text-[#37352f] dark:text-[#ebebeb] hover:bg-gray-200 dark:hover:bg-[#303030] transition-colors"
                    >
                        <LogOut size={16} />
                        Me déconnecter
                    </button>
                )}
            </div>
        </div>
    );
};

export default MaintenancePage;
