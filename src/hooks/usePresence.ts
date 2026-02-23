'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function usePresence(spaceId: string | null) {
    const [count, setCount] = useState(1);

    useEffect(() => {
        if (!spaceId) return;

        const sessionId = Math.random().toString(36).substring(2, 10);

        const channel = supabase.channel(`presence-${spaceId}`, {
            config: {
                presence: {
                    key: sessionId,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const userCount = Object.keys(state).length;
                setCount(Math.max(1, userCount));
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user: sessionId,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [spaceId]);

    return count;
}
