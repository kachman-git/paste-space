'use client';

import React, { useState } from 'react';

const EMOJI_OPTIONS = ['👍', '🔥', '❤️', '😂', '🎉', '👀', '💯', '🚀', '😁', '🥶', '🤬', '🤮', '🤡', '💩', '💀', '🤑'];

interface Reaction {
    emoji: string;
    count: number;
    reacted: boolean; // current user reacted
}

interface EmojiReactionsProps {
    itemId: string;
    spaceId: string;
}

export function EmojiReactions({ itemId, spaceId }: EmojiReactionsProps) {
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [showPicker, setShowPicker] = useState(false);

    // Use sessionStorage key to track this user's reactions
    const getStorageKey = (emoji: string) => `reaction-${itemId}-${emoji}`;

    const toggleReaction = async (emoji: string) => {
        const key = getStorageKey(emoji);
        const alreadyReacted = sessionStorage.getItem(key) === '1';

        // Optimistic update
        setReactions((prev) => {
            const existing = prev.find((r) => r.emoji === emoji);
            if (alreadyReacted) {
                // Remove reaction
                sessionStorage.removeItem(key);
                if (existing && existing.count <= 1) {
                    return prev.filter((r) => r.emoji !== emoji);
                }
                return prev.map((r) =>
                    r.emoji === emoji ? { ...r, count: r.count - 1, reacted: false } : r
                );
            } else {
                // Add reaction
                sessionStorage.setItem(key, '1');
                if (existing) {
                    return prev.map((r) =>
                        r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r
                    );
                }
                return [...prev, { emoji, count: 1, reacted: true }];
            }
        });
        setShowPicker(false);

        // Persist to API
        try {
            await fetch('/api/reactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_id: itemId,
                    space_id: spaceId,
                    emoji,
                    action: alreadyReacted ? 'remove' : 'add',
                }),
            });
        } catch (err) {
            console.error('Reaction error:', err);
        }
    };

    // Load reactions on mount
    React.useEffect(() => {
        const loadReactions = async () => {
            try {
                const res = await fetch(`/api/reactions?item_id=${itemId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.reactions) {
                        setReactions(
                            data.reactions.map((r: { emoji: string; count: number }) => ({
                                ...r,
                                reacted: sessionStorage.getItem(getStorageKey(r.emoji)) === '1',
                            }))
                        );
                    }
                }
            } catch {
                // Silently fail
            }
        };
        loadReactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);

    return (
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
            {/* Existing reactions */}
            {reactions.map((r) => (
                <button
                    key={r.emoji}
                    onClick={() => toggleReaction(r.emoji)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${r.reacted
                        ? 'bg-violet-500/20 border border-violet-500/30'
                        : 'theme-card-hover'
                        }`}
                >
                    <span>{r.emoji}</span>
                    <span className={r.reacted ? 'text-violet-400' : 'theme-faint'}>{r.count}</span>
                </button>
            ))}

            {/* Add reaction button */}
            <div className="relative">
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg theme-card-hover text-xs transition-all"
                    title="Add reaction"
                >
                    <svg className="w-3.5 h-3.5 theme-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg className="w-2.5 h-2.5 theme-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>

                {/* Picker dropdown */}
                {showPicker && (
                    <div className="absolute bottom-full left-0 mb-2 z-20">
                        <div className="flex gap-1 p-2 rounded-xl theme-card backdrop-blur-xl shadow-2xl">
                            {EMOJI_OPTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => toggleReaction(emoji)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-lg"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
