'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Item } from '@/lib/types';

export function useRealtimeItems(spaceId: string | null) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);

    // Fetch initial items
    const fetchItems = useCallback(async () => {
        if (!spaceId) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('space_id', spaceId)
            .order('created_at', { ascending: true });

        if (!error && data) {
            setItems(data as Item[]);
        }
        setLoading(false);
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
                    filter: `space_id=eq.${spaceId}`,
                },
                (payload) => {
                    const deletedId = (payload.old as { id: string }).id;
                    if (deletedId) {
                        setItems((prev) => prev.filter((item) => item.id !== deletedId));
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
