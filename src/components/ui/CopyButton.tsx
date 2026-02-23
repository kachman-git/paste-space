'use client';

import React, { useState, useCallback } from 'react';

interface CopyButtonProps {
    text: string;
    className?: string;
    size?: 'sm' | 'md';
}

export function CopyButton({ text, className = '', size = 'md' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    }, [text]);

    const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
    const padding = size === 'sm' ? 'p-1.5' : 'p-2';

    return (
        <button
            onClick={handleCopy}
            className={`${padding} rounded-lg transition-all duration-200 ${copied
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : 'theme-card-hover theme-muted'
                } ${className}`}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
            {copied ? (
                <svg
                    className={iconSize}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg
                    className={iconSize}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
            )}
        </button>
    );
}
