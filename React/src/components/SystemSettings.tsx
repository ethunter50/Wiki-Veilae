import { useState, useEffect } from 'react';
import { ChevronLeft, Info, Loader2, Save, ShieldAlert } from 'lucide-react';
import api from '../lib/axios';

const SystemSettings = ({ onBack }: { onBack: () => void }) => {
    const [settings, setSettings] = useState<any>({
        maintenance_mode: 'false',
        maintenance_reason: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            // Merge defaults in case keys don't exist yet
            setSettings({
                maintenance_mode: 'false',
                maintenance_reason: '',
                ...res.data
            });
        } catch (err) {
            console.error('Failed to load settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/admin/settings', { settings });
            alert('Paramètres mis à jour avec succès');
        } catch (err) {
            console.error('Failed to save settings', err);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-[#efefed] dark:hover:bg-[#252525] rounded-lg transition-colors text-[#91918e]">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-[#37352f] dark:text-[#d3d3d3]">Paramètres Système</h1>
                    <p className="text-[#91918e] text-sm mt-1">Configuration générale de l'application</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-[#ececeb] dark:border-[#2f2f2f] shadow-sm p-8">
                <h2 className="text-xl font-bold text-[#37352f] dark:text-[#ebebeb] mb-6 flex items-center gap-2">
                    <ShieldAlert className="text-amber-500" />
                    Mode Maintenance
                </h2>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-xl border border-[#ececeb] dark:border-[#353535]">
                        <div>
                            <h3 className="font-semibold text-[#37352f] dark:text-[#d3d3d3]">Activer la maintenance</h3>
                            <p className="text-sm text-[#91918e]">Seuls les administrateurs pourront accéder au site.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.maintenance_mode === 'true'}
                                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked ? 'true' : 'false' })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#37352f] dark:text-[#d3d3d3] mb-2">
                            Message de maintenance
                        </label>
                        <div className="relative">
                            <Info size={16} className="absolute top-3 left-3 text-[#91918e]" />
                            <textarea
                                value={settings.maintenance_reason}
                                onChange={(e) => setSettings({ ...settings, maintenance_reason: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-transparent border border-[#ececeb] dark:border-[#353535] rounded-xl text-[#37352f] dark:text-[#ebebeb] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
                                placeholder="Raison de la maintenance..."
                            />
                        </div>
                        <p className="text-xs text-[#91918e] mt-2">Ce message sera affiché aux utilisateurs tentant d'accéder au site.</p>
                    </div>

                    <div className="pt-6 border-t border-[#ececeb] dark:border-[#2f2f2f] flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Enregistrer les modifications
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
