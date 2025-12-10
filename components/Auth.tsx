
import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Terminal, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { FaultyTerminal, DecryptedText, Magnet, SpotlightCard } from './Animations';

interface AuthProps {
    onLogin: () => void;
}

export const Login: React.FC<AuthProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.login(email, password);
            onLogin();
            navigate('/');
        } catch (err: any) {
            console.error("Login failed", err);
            setError(err.message || "Authentication failed. Check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden relative selection:bg-violet-500/30 selection:text-white">

            {/* Background - Faulty Terminal Effect */}
            <FaultyTerminal text="01LETHRINUS_OS_SYSTEM_FAILURE_REBOOT" textColor="#8b5cf6" />

            {/* Overlay for depth */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 pointer-events-none"></div>

            {/* Main Login Card */}
            <div className="relative z-10 w-full max-w-md p-6">
                <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)" className="p-8 backdrop-blur-xl bg-black/40 border-white/5 shadow-2xl">
                    <div className="flex flex-col items-center mb-8 space-y-3">
                        <Magnet strength={5} activeScale={1.1}>
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-2">
                                <Terminal size={24} />
                            </div>
                        </Magnet>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-white tracking-widest font-mono">
                                <DecryptedText text="LETHRINUS_OS" speed={60} />
                            </h1>
                            <p className="text-xs text-slate-500 uppercase tracking-[0.3em] mt-1 font-mono">
                                Secure Access Terminal
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-400">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold ml-1">Identity</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all placeholder:text-slate-700 font-mono"
                                    placeholder="user@lethrinus.sys"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold ml-1">Passkey</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all placeholder:text-slate-700 font-mono"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative overflow-hidden rounded-lg bg-white/5 hover:bg-violet-600 border border-white/10 hover:border-violet-500 text-white py-3 transition-all duration-300 mt-4"
                        >
                            <div className="flex items-center justify-center gap-2 relative z-10">
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Connect...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xs font-bold uppercase tracking-widest group-hover:tracking-[0.2em] transition-all">Initialize</span>
                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-slate-700 font-mono">
                            System Version 5.2 // Status: <span className="text-emerald-500">Online</span>
                        </p>
                    </div>
                </SpotlightCard>
            </div>
        </div>
    );
};
