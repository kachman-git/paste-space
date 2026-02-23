'use client';

import React from 'react';
import { Item } from '@/lib/types';
import { CopyButton } from '@/components/ui/CopyButton';

interface TextItemProps {
    item: Item;
}

export function TextItem({ item }: TextItemProps) {
    return (
        <div className="group relative theme-card rounded-2xl p-5 transition-all duration-300 hover:shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </div>
                    <span className="text-xs theme-faint font-medium">TEXT</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton text={item.content || ''} size="sm" />
                </div>
            </div>

            {/* Content */}
            <p className="theme-text-secondary text-sm leading-relaxed whitespace-pre-wrap break-words">
                {item.content}
            </p>

            {/* Timestamp */}
            <div className="mt-3 text-xs theme-faint">
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
}
