'use client';

import React from 'react';
import { Item } from '@/lib/types';
import { getFileUrl } from '@/lib/upload';

interface FileItemProps {
    item: Item;
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getFileIcon(fileName: string | null): { color: string; bg: string } {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf':
            return { color: 'text-red-500', bg: 'bg-red-500/10' };
        case 'doc':
        case 'docx':
            return { color: 'text-blue-500', bg: 'bg-blue-500/10' };
        case 'xls':
        case 'xlsx':
            return { color: 'text-green-500', bg: 'bg-green-500/10' };
        case 'zip':
        case 'rar':
        case '7z':
            return { color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
        default:
            return { color: 'text-gray-500', bg: 'bg-gray-500/10' };
    }
}

export function FileItem({ item }: FileItemProps) {
    const fileUrl = item.storage_path ? getFileUrl(item.storage_path) : '';
    const { color, bg } = getFileIcon(item.file_name);

    const handleDownload = () => {
        if (!fileUrl) return;
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = item.file_name || `file-${item.id}`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="group relative theme-card rounded-2xl p-5 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start gap-4">
                {/* File Icon */}
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-6 h-6 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm theme-text font-medium truncate">
                        {item.file_name || 'Unknown file'}
                    </h4>
                    <p className="text-xs theme-faint mt-1">
                        {formatFileSize(item.file_size)}
                    </p>
                </div>

                {/* Download */}
                <button
                    onClick={handleDownload}
                    className="p-2 rounded-xl theme-card-hover transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Download file"
                >
                    <svg className="w-4 h-4 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            </div>

            {/* Timestamp */}
            <div className="mt-3 text-xs theme-faint">
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
}
