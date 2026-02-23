'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Space } from '@/lib/types';
import { SpaceView } from '@/components/SpaceView';
import { PassphraseGate } from '@/components/PassphraseGate';

export default function SpacePage() {
    const params = useParams();
    const slug = params.slug as string;

    const [space, setSpace] = useState<Space | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accessGranted, setAccessGranted] = useState(false);

    useEffect(() => {
        async function fetchSpace() {
            setLoading(true);

            const { data, error: fetchError } = await supabase
                .from('spaces')
                .select('*')
                .eq('slug', slug)
                .single();

            if (fetchError || !data) {
                setError('Space not found. It may have expired or the link is invalid.');
                setLoading(false);
                return;
            }

            // Check if expired
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                setError('This space has expired.');
                setLoading(false);
                return;
            }

            setSpace(data as Space);

            // Check secret access
            if (data.is_secret) {
                const storedAccess = sessionStorage.getItem(`space-access-${slug}`);
                if (storedAccess) {
                    setAccessGranted(true);
                }
            } else {
                setAccessGranted(true);
            }

            setLoading(false);
        }

        if (slug) {
            fetchSpace();
        }
    }, [slug]);

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500">Loading space...</p>
                </div>
            </div>
        );
    }

    // Error / not found
    if (error || !space) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3">Space Not Found</h1>
                    <p className="text-gray-400 text-sm mb-8">{error || 'This space does not exist.'}</p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>
        );
    }

    // Secret space gate
    if (space.is_secret && !accessGranted) {
        return (
            <PassphraseGate
                slug={slug}
                onSuccess={() => setAccessGranted(true)}
            />
        );
    }

    // Space view
    return <SpaceView space={space} />;
}
