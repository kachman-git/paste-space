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

    // Add item optimistically
    const addItemOptimistic = useCallback((item: Item) => {
        setItems((prev) => [...prev, item]);
    }, []);

    useEffect(() => {
        if (!spaceId) return;

        fetchItems();

        // Subscribe to realtime inserts
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
                        // Avoid duplicates (from optimistic updates)
                        if (prev.some((item) => item.id === newItem.id)) {
                            return prev;
                        }
                        return [...prev, newItem];
                    });
                }
            )
            .subscribe((status) => {
                setConnected(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [spaceId, fetchItems]);

    return { items, loading, connected, addItemOptimistic, setItems };
}
