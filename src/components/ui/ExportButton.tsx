'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Item } from '@/lib/types';
import { getFileUrl } from '@/lib/upload';

interface ExportButtonProps {
    items: Item[];
    spaceName: string;
}

function getExtension(item: Item): string {
    if (item.type === 'code' && item.language) {
        const langMap: Record<string, string> = {
            javascript: 'js', typescript: 'ts', python: 'py',
            html: 'html', css: 'css', json: 'json', sql: 'sql',
            bash: 'sh', java: 'java', go: 'go', rust: 'rs', php: 'php',
        };
        return langMap[item.language] || 'txt';
    }
    if (item.type === 'url') return 'txt';
    return 'txt';
}

export function ExportButton({ items, spaceName }: ExportButtonProps) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        if (items.length === 0) return;
        setExporting(true);

        try {
            const zip = new JSZip();
            let textIdx = 0;
            let fileIdx = 0;

            for (const item of items) {
                if (item.type === 'text' || item.type === 'url' || item.type === 'code') {
                    textIdx++;
                    const ext = getExtension(item);
                    const prefix = item.type === 'code' ? 'code' : item.type === 'url' ? 'link' : 'text';
                    zip.file(`${prefix}-${textIdx}.${ext}`, item.content || '');
                } else if (item.storage_path) {
                    fileIdx++;
                    const url = getFileUrl(item.storage_path);
                    try {
                        const res = await fetch(url);
                        if (res.ok) {
                            const blob = await res.blob();
                            const name = item.file_name || `file-${fileIdx}`;
                            zip.file(name, blob);
                        }
                    } catch {
                        // Skip files that fail to download
                    }
                }
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            saveAs(blob, `${spaceName || 'space'}-export.zip`);
        } catch (err) {
            console.error('Export error:', err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={exporting || items.length === 0}
            className="p-2 rounded-xl theme-card-hover transition-all duration-200 disabled:opacity-40"
            title="Export as ZIP"
        >
            {exporting ? (
                <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            ) : (
                <svg className="w-4 h-4 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            )}
        </button>
    );
}
