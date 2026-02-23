'use client';

import React from 'react';
import { Item } from '@/lib/types';
import { CopyButton } from '@/components/ui/CopyButton';

interface UrlItemProps {
    item: Item;
}

function getDomain(url: string): string {
    try {
        const u = new URL(url);
        return u.hostname;
    } catch {
        return url;
    }
}

export function UrlItem({ item }: UrlItemProps) {
    const url = item.content || '';
    const domain = getDomain(url);

    return (
        <div className="group relative theme-card rounded-2xl p-5 transition-all duration-300 hover:shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <span className="text-xs theme-faint font-medium">LINK</span>
                </div>
                <CopyButton text={url} size="sm" />
            </div>

            {/* URL Content */}
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
            >
                <div className="flex items-center gap-2 mb-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                        alt=""
                        className="w-4 h-4 rounded"
                        loading="lazy"
                    />
                    <span className="text-sm theme-muted">{domain}</span>
                </div>
                <p className="text-sm text-cyan-500 hover:text-cyan-400 transition-colors break-all leading-relaxed">
                    {url}
                </p>
            </a>

            {/* Timestamp */}
            <div className="mt-3 text-xs theme-faint">
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
}
