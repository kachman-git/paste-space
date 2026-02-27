'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Item } from '@/lib/types';

// Sort: pinned first, then newest first
function sortItems(items: Item[]): Item[] {
    return [...items].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

export function useRealtimeItems(spaceId: string | null) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
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
            .order('created_at', { ascending: false });

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

    // Update a single item locally and re-sort (used by PinButton)
    const updateItem = useCallback((itemId: string, updates: Partial<Item>) => {
        setItems((prev) => {
            const updated = prev.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
            );
            return sortItems(updated);
        });
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
                        return sortItems([newItem, ...prev]);
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'items',
                    filter: `space_id=eq.${spaceId}`,
                },
                (payload) => {
                    const updatedItem = payload.new as Item;
                    setItems((prev) => {
                        const updated = prev.map((item) =>
                            item.id === updatedItem.id ? updatedItem : item
                        );
                        return sortItems(updated);
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
                    const oldRecord = payload.old as Record<string, unknown>;
                    const deletedId = oldRecord?.id as string | undefined;

                    if (deletedId) {
                        setItems((prev) => prev.filter((item) => item.id !== deletedId));
                    } else {
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

    return { items, loading, connected, setItems, removeItem, updateItem, clearItems };
}
