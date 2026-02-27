'use client';

import React, { useState } from 'react';
import { Item } from '@/lib/types';
import { CopyButton } from '@/components/ui/CopyButton';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { PinButton } from '@/components/ui/PinButton';
import { EmojiReactions } from '@/components/ui/EmojiReactions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TextItemProps {
    item: Item;
    onDelete?: () => void;
    onPin?: (pinned: boolean) => void;
}

function isMarkdown(text: string): boolean {
    const mdPatterns = [
        /^#{1,6}\s/m,           // headings
        /\*\*.+\*\*/,            // bold
        /\*.+\*/,                // italic
        /^\s*[-*+]\s/m,          // lists
        /^\s*\d+\.\s/m,          // ordered lists
        /\[.+\]\(.+\)/,          // links
        /```/,                    // code fences
        /^\|.+\|$/m,             // tables
        /^>\s/m,                  // blockquotes
        /^---$/m,                 // horizontal rule
    ];
    return mdPatterns.filter((p) => p.test(text)).length >= 1;
}

export function TextItem({ item, onDelete, onPin }: TextItemProps) {
    const text = item.content || '';
    const hasMd = isMarkdown(text);
    const [showRaw, setShowRaw] = useState(false);

    const CHAR_LIMIT = 300;
    const isLong = text.length > CHAR_LIMIT;
    const [expanded, setExpanded] = useState(false);
    const displayText = isLong && !expanded ? text.slice(0, CHAR_LIMIT) + '…' : text;

    return (
        <div className="group relative theme-card rounded-2xl p-5 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </div>
                    <span className="text-xs theme-faint font-medium">TEXT</span>
                    {hasMd && (
                        <button
                            onClick={() => setShowRaw(!showRaw)}
                            className="text-xs theme-faint hover:theme-muted px-1.5 py-0.5 rounded theme-card-hover transition-all"
                        >
                            {showRaw ? 'Preview' : 'Raw'}
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <PinButton itemId={item.id} isPinned={item.is_pinned} onToggle={onPin} />
                    <CopyButton text={text} size="sm" />
                    {onDelete && <DeleteButton onDelete={onDelete} />}
                </div>
            </div>

            {/* Content */}
            {hasMd && !showRaw ? (
                <div className="prose prose-sm prose-invert max-w-none theme-text-secondary leading-relaxed markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayText}</ReactMarkdown>
                </div>
            ) : (
                <p className="theme-text-secondary text-sm leading-relaxed whitespace-pre-wrap break-words">{displayText}</p>
            )}

            {/* Show more / less toggle */}
            {isLong && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}

            {/* Reactions */}
            <EmojiReactions itemId={item.id} spaceId={item.space_id} />

            {/* Timestamp */}
            <div className="mt-2 text-xs theme-faint">
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
}
