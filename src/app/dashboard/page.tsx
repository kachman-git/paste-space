'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';

interface SpaceRow {
    id: string;
    slug: string;
    name: string | null;
    is_secret: boolean;
    created_at: string;
    expires_at: string | null;
    view_count: number;
    item_count?: number;
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return date.toLocaleDateString();
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading, session, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [spaces, setSpaces] = useState<SpaceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user || !session) {
            router.push('/auth/login');
            return;
        }

        const fetchMySpaces = async () => {
            try {
                const res = await fetch('/api/spaces/mine', {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                });

                if (res.status === 401) {
                    router.push('/auth/login');
                    return;
                }

                const data = await res.json();
                if (data.spaces) {
                    setSpaces(data.spaces);
                } else {
                    setError('Failed to load spaces');
                }
            } catch (err) {
                console.error('Fetch spaces error:', err);
                setError('Failed to load spaces');
            }
            setLoading(false);
        };

        fetchMySpaces();
    }, [user, session, authLoading, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/[0.04] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/[0.04] rounded-full blur-[120px]" />
            </div>

            <header className="sticky top-0 z-40 theme-header">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </Link>
                        <div className="h-6 w-px" style={{ background: 'var(--border-card)' }} />
                        <span className="text-sm theme-text-secondary font-medium">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={toggleTheme} className="p-2 rounded-xl theme-card-hover" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                            {theme === 'dark' ? (
                                <svg className="w-4 h-4 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl theme-pill">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-xs theme-muted hidden sm:block max-w-[160px] truncate">{user?.email}</span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="px-3 py-1.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold theme-text">Your Spaces</h1>
                        <p className="text-sm theme-muted mt-1">Manage and access your paste spaces</p>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Space
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                ) : spaces.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-violet-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold theme-text mb-2">No spaces yet</h3>
                        <p className="theme-muted text-sm mb-6 max-w-sm mx-auto">
                            Create your first space to start sharing content. All spaces you create while logged in will appear here.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Create Your First Space
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {spaces.map((space) => {
                            const isExpired = space.expires_at && new Date(space.expires_at) < new Date();
                            return (
                                <Link
                                    key={space.id}
                                    href={`/${space.slug}`}
                                    className={`group theme-card rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isExpired ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-semibold theme-text text-sm group-hover:text-violet-400 transition-colors truncate pr-2">
                                            {space.name || space.slug}
                                        </h3>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {space.is_secret && (
                                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-medium">
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Secret
                                                </span>
                                            )}
                                            {isExpired && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[10px] font-medium">
                                                    Expired
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs theme-faint">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                                            </svg>
                                            {space.item_count} items
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {space.view_count} views
                                        </span>
                                        <span className="ml-auto">{timeAgo(space.created_at)}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
