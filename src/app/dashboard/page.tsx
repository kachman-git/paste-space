'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/lib/supabase';

interface SpaceRow {
    id: string;
    slug: string;
    name: string | null;
    created_at: string;
    view_count: number;
    item_count?: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [spaces, setSpaces] = useState<SpaceRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const fetchSpaces = async () => {
            // Fetch spaces — for now, fetch all spaces (owner_id filtering would be added when the column exists)
            const { data, error } = await supabase
                .from('spaces')
                .select('id, slug, name, created_at, view_count')
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error && data) {
                // Get item counts
                const spacesWithCounts = await Promise.all(
                    data.map(async (space) => {
                        const { count } = await supabase
                            .from('items')
                            .select('*', { count: 'exact', head: true })
                            .eq('space_id', space.id);
                        return { ...space, item_count: count || 0 };
                    })
                );
                setSpaces(spacesWithCounts);
            }
            setLoading(false);
        };

        fetchSpaces();
    }, [user, authLoading, router]);

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
                        <span className="text-sm theme-muted hidden sm:block">{user?.email}</span>
                        <button
                            onClick={handleSignOut}
                            className="px-3 py-1.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold theme-text">Your Spaces</h1>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Space
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                ) : spaces.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-violet-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold theme-text mb-2">No spaces yet</h3>
                        <p className="theme-muted text-sm">Create your first space to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {spaces.map((space) => (
                            <Link
                                key={space.id}
                                href={`/${space.slug}`}
                                className="group theme-card rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <h3 className="font-semibold theme-text text-sm mb-2 group-hover:text-violet-400 transition-colors">
                                    {space.name || space.slug}
                                </h3>
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
                                    <span>{new Date(space.created_at).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
