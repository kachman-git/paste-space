'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Space, ItemType } from '@/lib/types';
import { useRealtimeItems } from '@/hooks/useRealtimeItems';
import { usePresence } from '@/hooks/usePresence';
import { uploadFile } from '@/lib/upload';
import { Header } from '@/components/Header';
import { DropZone } from '@/components/DropZone';
import { TextItem } from '@/components/items/TextItem';
import { CodeItem } from '@/components/items/CodeItem';
import { ImageItem } from '@/components/items/ImageItem';
import { FileItem } from '@/components/items/FileItem';
import { UrlItem } from '@/components/items/UrlItem';
import { Item } from '@/lib/types';

interface SpaceViewProps {
    space: Space;
}

// URL detection
const URL_REGEX = /^(https?:\/\/[^\s]+)$/i;

// Code detection heuristics
function isLikelyCode(text: string): { isCode: boolean; language?: string } {
    const lines = text.split('\n');
    const codeIndicators = [
        /^(import|export|from|require|const |let |var |function |class |def |fn |pub |use |package |#include)/m,
        /[{};]$/m,
        /=>/,
        /\b(if|else|for|while|return|switch|case)\s*[({]/m,
        /^\s*(\/\/|#|\/\*|\*|--)/m,
        /<\/?[a-z][a-z0-9]*[\s>]/i,
    ];

    if (lines.length >= 2) {
        const score = codeIndicators.filter((r) => r.test(text)).length;
        if (score >= 2) {
            if (/\b(import|export|const|let|=>|async|await)\b/.test(text)) return { isCode: true, language: 'typescript' };
            if (/\bdef\b.*:/.test(text)) return { isCode: true, language: 'python' };
            if (/<\/?[a-z][a-z0-9]*[\s>]/i.test(text) && /className|class=/.test(text)) return { isCode: true, language: 'html' };
            if (/\{[\s\S]*:\s*[\s\S]*[;}]/.test(text) && !/[=;]/.test(text.split('{')[0])) return { isCode: true, language: 'css' };
            if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)\b/im.test(text)) return { isCode: true, language: 'sql' };
            return { isCode: true };
        }
    }
    return { isCode: false };
}

function detectContentType(text: string): { type: ItemType; language?: string } {
    if (URL_REGEX.test(text.trim())) return { type: 'url' };
    const codeCheck = isLikelyCode(text);
    if (codeCheck.isCode) return { type: 'code', language: codeCheck.language };
    return { type: 'text' };
}

function getFileItemType(file: File): ItemType {
    if (file.type.startsWith('image/gif')) return 'gif';
    if (file.type.startsWith('image/')) return 'image';
    return 'file';
}

export function SpaceView({ space }: SpaceViewProps) {
    const { items, loading } = useRealtimeItems(space.id);
    const presenceCount = usePresence(space.id);
    const [uploading, setUploading] = useState(false);
    const [pasting, setPasting] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when new items arrive
    useEffect(() => {
        if (items.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [items.length]);

    // Create item via API
    const createItem = useCallback(
        async (itemData: {
            type: ItemType;
            content?: string;
            storage_path?: string;
            file_name?: string;
            file_size?: number;
            language?: string;
        }) => {
            try {
                const res = await fetch('/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        space_id: space.id,
                        ...itemData,
                    }),
                });
                const data = await res.json();
                return data.item;
            } catch (err) {
                console.error('Create item error:', err);
                return null;
            }
        },
        [space.id]
    );

    // Handle paste events
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            const clipboardData = e.clipboardData;
            if (!clipboardData) return;

            // Check for files (images, etc.)
            const files = Array.from(clipboardData.files);
            if (files.length > 0) {
                e.preventDefault();
                for (const file of files) {
                    await handleFileUpload(file);
                }
                return;
            }

            // Check for text
            const text = clipboardData.getData('text/plain');
            if (text) {
                e.preventDefault();
                setPasting(true);
                const { type, language } = detectContentType(text);
                await createItem({ type, content: text, language });
                setPasting(false);
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [space.id, createItem]);

    // Handle file upload
    const handleFileUpload = async (file: File) => {
        setUploading(true);
        try {
            const result = await uploadFile(space.id, file);
            if (result) {
                const type = getFileItemType(file);
                await createItem({
                    type,
                    storage_path: result.path,
                    file_name: file.name,
                    file_size: file.size,
                });
            }
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    // Handle file drop
    const handleFileDrop = useCallback(
        async (files: File[]) => {
            for (const file of files) {
                await handleFileUpload(file);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [space.id, createItem]
    );

    // Render item by type
    const renderItem = (item: Item) => {
        switch (item.type) {
            case 'text':
                return <TextItem key={item.id} item={item} />;
            case 'code':
                return <CodeItem key={item.id} item={item} />;
            case 'image':
            case 'gif':
                return <ImageItem key={item.id} item={item} />;
            case 'file':
                return <FileItem key={item.id} item={item} />;
            case 'url':
                return <UrlItem key={item.id} item={item} />;
            default:
                return <TextItem key={item.id} item={item} />;
        }
    };

    // Copy all text
    const handleCopyAllText = async () => {
        const textItems = items
            .filter((item) => item.type === 'text' || item.type === 'code' || item.type === 'url')
            .map((item) => item.content)
            .filter(Boolean)
            .join('\n\n---\n\n');

        if (textItems) {
            await navigator.clipboard.writeText(textItems);
        }
    };

    return (
        <DropZone onFileDrop={handleFileDrop}>
            <Header space={space} presenceCount={presenceCount} />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Upload / Paste progress */}
                {(uploading || pasting) && (
                    <div className="mb-6">
                        <div className="theme-card rounded-2xl p-4 flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                            <span className="text-sm theme-muted">
                                {uploading ? 'Uploading file...' : 'Sending paste...'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mb-6">
                            <svg
                                className="w-10 h-10 text-violet-400/60"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold theme-text mb-2">
                            Your space is ready
                        </h2>
                        <p className="theme-muted text-sm max-w-md mb-2">
                            Paste text, images, code, or URLs anywhere on this page.
                            <br />
                            Drag & drop files to upload them.
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                            <kbd className="px-2.5 py-1 rounded-lg theme-kbd text-xs font-mono">
                                Ctrl+V
                            </kbd>
                            <span className="text-xs theme-muted">to paste</span>
                            <span className="text-xs theme-muted mx-2">•</span>
                            <span className="text-xs theme-muted">drag files to upload</span>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                )}

                {/* Items grid */}
                {items.length > 0 && (
                    <>
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm theme-muted">
                                {items.length} {items.length === 1 ? 'item' : 'items'}
                            </p>
                            <button
                                onClick={handleCopyAllText}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg theme-card-hover text-xs font-medium transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                </svg>
                                Copy All Text
                            </button>
                        </div>

                        {/* Items grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map(renderItem)}
                        </div>
                    </>
                )}

                <div ref={bottomRef} />
            </main>

            {/* Paste hint (fixed bottom) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full theme-pill shadow-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs theme-muted">
                        Paste anywhere or drag files to share
                    </span>
                </div>
            </div>
        </DropZone>
    );
}
