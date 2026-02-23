'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface PassphraseGateProps {
    slug: string;
    onSuccess: (spaceId: string) => void;
}

export function PassphraseGate({ slug, onSuccess }: PassphraseGateProps) {
    const [passphrase, setPassphrase] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passphrase.trim()) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/spaces/${slug}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passphrase }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Store access in sessionStorage
                sessionStorage.setItem(`space-access-${slug}`, data.space_id);
                onSuccess(data.space_id);
            } else {
                setError(data.error || 'Invalid passphrase');
            }
        } catch {
            setError('Failed to verify. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl">
                    {/* Lock Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-white text-center mb-2">
                        Secret Space
                    </h1>
                    <p className="text-gray-400 text-sm text-center mb-8">
                        This space is protected. Enter the passphrase to continue.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={passphrase}
                                onChange={(e) => setPassphrase(e.target.value)}
                                placeholder="Enter passphrase..."
                                className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
                                autoFocus
                            />
                            {error && (
                                <p className="text-red-400 text-sm mt-2 flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={loading || !passphrase.trim()}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Unlock Space'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
