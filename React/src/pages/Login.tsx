import { useState } from 'react';
import api from '../lib/axios';
import { LogIn, User, Lock, Loader2 } from 'lucide-react';

interface LoginProps {
    onLoginSuccess: (user: any) => void;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Get CSRF cookie
            await api.get('/sanctum/csrf-cookie', { baseURL: '/' });

            // Then login
            const response = await api.post('/login', {
                username: username.trim(),
                password: password.trim(),
            });



            onLoginSuccess(response.data.user);
        } catch (err: any) {
            console.error('Full Error Response:', err.response);
            console.error('Login error details:', err.response?.data);

            const backendMessage = err.response?.data?.errors?.username?.[0]
                || err.response?.data?.message
                || 'Identifiants incorrects';
            setError(backendMessage);
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa] dark:bg-[#191919] p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#202020] rounded-2xl shadow-xl p-8 border border-[#ececeb] dark:border-[#2f2f2f]">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-[#37352f] dark:text-[#ebebeb]">Bienvenue</h1>
                    <p className="text-[#91918e] text-sm mt-1">Connectez-vous à votre Wiki</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-[#91918e] uppercase tracking-wider mb-1.5 ml-1">
                            Pseudo
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91918e]">
                                <User size={18} />
                            </span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                className="w-full pl-10 pr-4 py-2.5 bg-[#f7f7f5] dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white"
                                placeholder="hunter50"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#91918e] uppercase tracking-wider mb-1.5 ml-1">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91918e]">
                                <Lock size={18} />
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                className="w-full pl-10 pr-4 py-2.5 bg-[#f7f7f5] dark:bg-[#252525] border border-[#ececeb] dark:border-[#2f2f2f] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            'Se connecter'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[#91918e] text-xs">
                        Besoin d'aide ? Contactez l'administrateur.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
