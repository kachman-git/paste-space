'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Space, Item } from '@/lib/types';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/components/ui/Toast';
import { QRModal } from '@/components/ui/QRModal';
import { ExportButton } from '@/components/ui/ExportButton';

interface HeaderProps {
    space: Space;
    presenceCount: number;
    items: Item[];
}

export function Header({ space, presenceCount, items }: HeaderProps) {
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [viewCount, setViewCount] = useState<number | null>(null);
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useToast();

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${space.slug}`
        : `/${space.slug}`;

    // Track view on mount
    useEffect(() => {
        const trackView = async () => {
            try {
                const res = await fetch(`/api/spaces/${space.slug}/analytics`, { method: 'POST' });
                if (res.ok) {
                    const data = await res.json();
                    setViewCount(data.view_count);
                }
            } catch {
                // Silently fail
            }
        };
        trackView();
    }, [space.slug]);

    const handleShare = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            showToast('Space link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
            showToast('Failed to copy link', 'error');
        }
    }, [shareUrl, showToast]);

    return (
        <>
            <header className="sticky top-0 z-40 theme-header">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Left: Logo + Space info */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 theme-muted hover:text-inherit transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </Link>
                        <div className="h-6 w-px" style={{ background: 'var(--border-card)' }} />
                        <div className="flex items-center gap-2">
                            {space.is_secret && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-xs font-medium">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Secret
                                </span>
                            )}
                            <span className="text-sm theme-text-secondary font-medium hidden sm:block">
                                {space.name || space.slug}
                            </span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <button onClick={toggleTheme} className="p-2 rounded-xl theme-card-hover transition-all duration-200" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
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

                        {/* Export button */}
                        <ExportButton items={items} spaceName={space.name || space.slug} />

                        {/* QR Code button */}
                        <button onClick={() => setShowQR(true)} className="p-2 rounded-xl theme-card-hover transition-all duration-200" title="Show QR code">
                            <svg className="w-4 h-4 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </button>

                        {/* Presence + View Count */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full theme-pill">
                            <div className="relative flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                <div className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            </div>
                            <span className="text-xs theme-text-secondary font-medium">
                                {presenceCount} {presenceCount === 1 ? 'viewer' : 'viewers'}
                            </span>
                            {viewCount !== null && viewCount > 0 && (
                                <>
                                    <div className="w-px h-3" style={{ background: 'var(--border-card)' }} />
                                    <span className="text-xs theme-faint flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        {viewCount}
                                    </span>
                                </>
                            )}
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
                                    <span className="hidden md:block">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    <span className="hidden md:block">Share</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* QR Modal */}
            <QRModal url={shareUrl} isOpen={showQR} onClose={() => setShowQR(false)} />
        </>
    );
}
