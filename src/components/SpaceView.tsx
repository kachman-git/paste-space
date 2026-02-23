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

const URL_REGEX = /^(https?:\/\/[^\s]+)$/i;

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
    const { items, loading, removeItem, clearItems } = useRealtimeItems(space.id);
    const presenceCount = usePresence(space.id);
    const [uploading, setUploading] = useState(false);
    const [pasting, setPasting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [mobileText, setMobileText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (items.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [items.length]);

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
                    body: JSON.stringify({ space_id: space.id, ...itemData }),
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

    // Delete single item
    const handleDeleteItem = useCallback(
        async (itemId: string) => {
            removeItem(itemId);
            try {
                await fetch(`/api/items?id=${itemId}`, { method: 'DELETE' });
            } catch (err) {
                console.error('Delete item error:', err);
            }
        },
        [removeItem]
    );

    // Delete all items
    const handleDeleteAll = useCallback(async () => {
        setDeleting(true);
        clearItems();
        try {
            await fetch(`/api/items?space_id=${space.id}`, { method: 'DELETE' });
        } catch (err) {
            console.error('Delete all error:', err);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    }, [space.id, clearItems]);

    // Paste handler
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
            const clipboardData = e.clipboardData;
            if (!clipboardData) return;

            const files = Array.from(clipboardData.files);
            if (files.length > 0) {
                e.preventDefault();
                for (const file of files) await handleFileUpload(file);
                return;
            }

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

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        try {
            const result = await uploadFile(space.id, file);
            if (result) {
                const type = getFileItemType(file);
                await createItem({ type, storage_path: result.path, file_name: file.name, file_size: file.size });
            }
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleFileDrop = useCallback(
        async (files: File[]) => {
            for (const file of files) await handleFileUpload(file);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [space.id, createItem]
    );

    const renderItem = (item: Item) => {
        const onDelete = () => handleDeleteItem(item.id);
        switch (item.type) {
            case 'text':
                return <TextItem key={item.id} item={item} onDelete={onDelete} />;
            case 'code':
                return <CodeItem key={item.id} item={item} onDelete={onDelete} />;
            case 'image':
            case 'gif':
                return <ImageItem key={item.id} item={item} onDelete={onDelete} />;
            case 'file':
                return <FileItem key={item.id} item={item} onDelete={onDelete} />;
            case 'url':
                return <UrlItem key={item.id} item={item} onDelete={onDelete} />;
            default:
                return <TextItem key={item.id} item={item} onDelete={onDelete} />;
        }
    };

    const handleCopyAllText = async () => {
        const textItems = items
            .filter((item) => item.type === 'text' || item.type === 'code' || item.type === 'url')
            .map((item) => item.content)
            .filter(Boolean)
            .join('\n\n---\n\n');
        if (textItems) await navigator.clipboard.writeText(textItems);
    };

    return (
        <DropZone onFileDrop={handleFileDrop}>
            <Header space={space} presenceCount={presenceCount} />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
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

                {!loading && items.length === 0 && (
                    <>
                        {/* Desktop empty state */}
                        <div className="hidden md:flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mb-6">
                                <svg className="w-10 h-10 text-violet-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold theme-text mb-2">Your space is ready</h2>
                            <p className="theme-muted text-sm max-w-md mb-2">
                                Paste text, images, code, or URLs anywhere on this page.<br />Drag & drop files to upload them.
                            </p>
                            <div className="flex items-center gap-2 mt-4">
                                <kbd className="px-2.5 py-1 rounded-lg theme-kbd text-xs font-mono">Ctrl+V</kbd>
                                <span className="text-xs theme-muted">to paste</span>
                                <span className="text-xs theme-muted mx-2">•</span>
                                <span className="text-xs theme-muted">drag files to upload</span>
                            </div>
                        </div>

                        {/* Mobile empty state — text input + file upload */}
                        <div className="md:hidden flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-violet-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold theme-text mb-1">Your space is ready</h2>
                            <p className="theme-muted text-sm mb-6">Type or paste something to share</p>


                        </div>
                    </>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                )}

                {items.length > 0 && (
                    <>
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm theme-muted">
                                {items.length} {items.length === 1 ? 'item' : 'items'}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopyAllText}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg theme-card-hover text-xs font-medium transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy All
                                </button>

                                {/* Delete All button */}
                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete All
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-red-400">Sure?</span>
                                        <button
                                            onClick={handleDeleteAll}
                                            disabled={deleting}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                                        >
                                            {deleting ? (
                                                <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                            ) : (
                                                'Yes, delete all'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium theme-card-hover transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map(renderItem)}
                        </div>
                    </>
                )}

                <div ref={bottomRef} className="pb-20 md:pb-0" />

                {/* Hidden file input for mobile */}
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        for (const file of files) await handleFileUpload(file);
                        e.target.value = '';
                    }}
                />
            </main>

            {/* Desktop: passive hint pill */}
            <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full theme-pill shadow-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs theme-muted">Paste anywhere or drag files to share</span>
                </div>
            </div>

            {/* Mobile: fixed bottom input bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 theme-header px-3 py-3 safe-area-bottom">
                <div className="flex items-end gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 rounded-xl theme-card-hover transition-all flex-shrink-0"
                        title="Upload file"
                    >
                        <svg className="w-5 h-5 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <textarea
                        value={mobileText}
                        onChange={(e) => setMobileText(e.target.value)}
                        placeholder="Type or paste here..."
                        className="flex-1 px-4 py-2.5 rounded-xl theme-input text-sm resize-none max-h-32 transition-all"
                        rows={1}
                        onInput={(e) => {
                            const el = e.target as HTMLTextAreaElement;
                            el.style.height = 'auto';
                            el.style.height = Math.min(el.scrollHeight, 128) + 'px';
                        }}
                    />
                    <button
                        onClick={async () => {
                            if (!mobileText.trim()) return;
                            setPasting(true);
                            const { type, language } = detectContentType(mobileText);
                            await createItem({ type, content: mobileText, language });
                            setMobileText('');
                            setPasting(false);
                        }}
                        disabled={!mobileText.trim() || pasting}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white transition-all disabled:opacity-40 flex-shrink-0"
                    >
                        {pasting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </DropZone>
    );
}
