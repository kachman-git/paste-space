'use client';

import React, { useState } from 'react';

interface PinButtonProps {
    itemId: string;
    isPinned: boolean;
    onToggle?: (pinned: boolean) => void;
}

export function PinButton({ itemId, isPinned, onToggle }: PinButtonProps) {
    const [pinned, setPinned] = useState(isPinned);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        const newVal = !pinned;
        setPinned(newVal);
        setLoading(true);

        try {
            await fetch('/api/items', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemId, is_pinned: newVal }),
            });
            onToggle?.(newVal);
        } catch (err) {
            console.error('Pin toggle error:', err);
            setPinned(!newVal); // revert
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`p-1.5 rounded-lg transition-all duration-200 ${pinned
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'theme-faint hover:theme-muted theme-card-hover'
                }`}
            title={pinned ? 'Unpin item' : 'Pin to top'}
        >
            <svg
                className="w-3.5 h-3.5"
                fill={pinned ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
            </svg>
        </button>
    );
}
