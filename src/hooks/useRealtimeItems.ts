'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Item } from '@/lib/types';
import { useSound } from '@/hooks/useSound';

export function useRealtimeItems(spaceId: string | null) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const { play: playSound } = useSound();
    const initialLoadDone = useRef(false);

    // Fetch initial items
    const fetchItems = useCallback(async () => {
        if (!spaceId) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('space_id', spaceId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: true });

        if (!error && data) {
            setItems(data as Item[]);
        }
        setLoading(false);
        initialLoadDone.current = true;
    }, [spaceId]);

    // Remove item from local state
    const removeItem = useCallback((itemId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
    }, []);

    // Clear all items from local state
    const clearItems = useCallback(() => {
        setItems([]);
    }, []);

    useEffect(() => {
        if (!spaceId) return;

        fetchItems();

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`space-${spaceId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'items',
                    filter: `space_id=eq.${spaceId}`,
                },
                (payload) => {
                    const newItem = payload.new as Item;
                    setItems((prev) => {
                        if (prev.some((item) => item.id === newItem.id)) {
                            return prev;
                        }
                        // Play sound for new items from others (after initial load)
                        if (initialLoadDone.current) {
                            playSound();
                        }
                        return [...prev, newItem];
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'items',
                },
                (payload) => {
                    // payload.old contains at minimum the primary key (id)
                    const oldRecord = payload.old as Record<string, unknown>;
                    const deletedId = oldRecord?.id as string | undefined;

                    if (deletedId) {
                        setItems((prev) => prev.filter((item) => item.id !== deletedId));
                    } else {
                        // Fallback: re-fetch all items if we can't identify which was deleted
                        fetchItems();
                    }
                }
            )
            .subscribe((status) => {
                setConnected(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [spaceId, fetchItems]);

    return { items, loading, connected, setItems, removeItem, clearItems };
}
