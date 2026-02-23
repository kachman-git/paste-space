'use client';

import React from 'react';
import { Item } from '@/lib/types';
import { getFileUrl } from '@/lib/upload';

interface ImageItemProps {
    item: Item;
}

export function ImageItem({ item }: ImageItemProps) {
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
        <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${isGif ? 'bg-pink-500/10' : 'bg-purple-500/10'} flex items-center justify-center`}>
                        <svg className={`w-3.5 h-3.5 ${isGif ? 'text-pink-400' : 'text-purple-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{isGif ? 'GIF' : 'IMAGE'}</span>
                </div>
                <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Download"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            </div>

            {/* Image */}
            <div className="px-3 pb-3">
                <div className="rounded-xl overflow-hidden bg-black/20">
                    {imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageUrl}
                            alt={item.file_name || 'Pasted image'}
                            className="w-full h-auto max-h-48 object-contain"
                            loading="lazy"
                        />
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 pb-3 flex items-center justify-between">
                <span className="text-xs text-gray-600 truncate max-w-[200px]">
                    {item.file_name || 'Image'}
                </span>
                <span className="text-xs text-gray-600">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
