'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Space } from '@/lib/types';
import { useTheme } from '@/components/ThemeProvider';

interface HeaderProps {
    space: Space;
    presenceCount: number;
}

export function Header({ space, presenceCount }: HeaderProps) {
    const [copied, setCopied] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${space.slug}`
        : `/${space.slug}`;

    const handleShare = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    }, [shareUrl]);

    return (
        <header className="sticky top-0 z-40 theme-header">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Left: Logo + Space info */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 theme-muted hover:text-inherit transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </Link>

                    <div className="h-6 w-px" style={{ background: 'var(--border-card)' }} />

                    <div className="flex items-center gap-2">
                        {space.is_secret && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 dark:text-amber-400 text-xs font-medium">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Secret
                            </span>
                        )}
                        <span className="text-sm theme-text-secondary font-medium">
                            {space.name || space.slug}
                        </span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl theme-card-hover transition-all duration-200"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
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

                    {/* Presence indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full theme-pill">
                        <div className="relative flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <div className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                        <span className="text-xs theme-text-secondary font-medium">
                            {presenceCount} {presenceCount === 1 ? 'viewer' : 'viewers'}
                        </span>
                    </div>

                    {/* Share button */}
                    <button
                        onClick={handleShare}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${copied
                                ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                : 'theme-card-hover'
                            }`}
                    >
                        {copied ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
