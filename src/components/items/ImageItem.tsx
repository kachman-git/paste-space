'use client';

import React from 'react';
import { Item } from '@/lib/types';
import { getFileUrl } from '@/lib/upload';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { PinButton } from '@/components/ui/PinButton';
import { EmojiReactions } from '@/components/ui/EmojiReactions';

interface ImageItemProps {
    item: Item;
    onDelete?: () => void;
    onPin?: (pinned: boolean) => void;
}

export function ImageItem({ item, onDelete, onPin }: ImageItemProps) {
    const imageUrl = item.storage_path ? getFileUrl(item.storage_path) : '';
    const isGif = item.type === 'gif';

    const handleDownload = () => {
        if (!imageUrl) return;
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = item.file_name || `image-${item.id}`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="group relative theme-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${isGif ? 'bg-pink-500/10' : 'bg-purple-500/10'} flex items-center justify-center`}>
                        <svg className={`w-3.5 h-3.5 ${isGif ? 'text-pink-500' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-xs theme-faint font-medium">{isGif ? 'GIF' : 'IMAGE'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <PinButton itemId={item.id} isPinned={item.is_pinned} onToggle={onPin} />
                    <button onClick={handleDownload} className="p-1.5 rounded-lg theme-card-hover transition-all opacity-0 group-hover:opacity-100" title="Download">
                        <svg className="w-3.5 h-3.5 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                    {onDelete && <DeleteButton onDelete={onDelete} />}
                </div>
            </div>
            <div className="px-3 pb-3">
                <div className="rounded-xl overflow-hidden bg-black/10">
                    {imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl} alt={item.file_name || 'Pasted image'} className="w-full h-auto max-h-48 object-contain" loading="lazy" />
                    )}
                </div>
            </div>
            <div className="px-4 pb-3">
                <EmojiReactions itemId={item.id} spaceId={item.space_id} />
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs theme-faint truncate max-w-[200px]">{item.file_name || 'Image'}</span>
                    <span className="text-xs theme-faint">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>
    );
}
