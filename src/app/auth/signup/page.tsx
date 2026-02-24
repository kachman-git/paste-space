'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';

export default function SignupPage() {
    const router = useRouter();
    const { signUp } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signUp(email, password);
            setSuccess(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Sign up failed';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
                <div className="relative z-10 w-full max-w-md text-center">
                    <div className="theme-card rounded-3xl p-8">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold theme-text mb-2">Check your email</h2>
                        <p className="theme-muted text-sm mb-6">
                            We sent a confirmation link to <strong className="theme-text">{email}</strong>.
                            Click the link to activate your account.
                        </p>
                        <Link
                            href="/auth/login"
                            className="inline-flex px-6 py-2.5 rounded-xl bg-violet-500/10 text-violet-500 text-sm font-medium hover:bg-violet-500/20 transition-all"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/[0.07] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/[0.07] rounded-full blur-[120px]" />
            </div>

            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 p-2.5 rounded-xl theme-card-hover z-10"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                {theme === 'dark' ? (
                    <svg className="w-5 h-5 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                )}
            </button>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold theme-text">PasteSpace</span>
                    </Link>
                    <h1 className="text-2xl font-bold theme-text">Create an account</h1>
                    <p className="theme-muted text-sm mt-2">Save your spaces and access them from anywhere</p>
                </div>

                <div className="theme-card rounded-3xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs theme-faint mb-1.5 font-medium">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-2.5 rounded-xl theme-input text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs theme-faint mb-1.5 font-medium">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                className="w-full px-4 py-2.5 rounded-xl theme-input text-sm"
                                required
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </div>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm theme-muted mt-6">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-violet-500 hover:text-violet-400 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
