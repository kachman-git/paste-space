'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropZoneProps {
    onFileDrop: (files: File[]) => void;
    children: React.ReactNode;
}

export function DropZone({ onFileDrop, children }: DropZoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            setIsDragActive(false);
            if (acceptedFiles.length > 0) {
                onFileDrop(acceptedFiles);
            }
        },
        [onFileDrop]
    );

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
        noClick: true,
        noKeyboard: true,
        maxSize: 50 * 1024 * 1024, // 50MB
    });

    return (
        <div {...getRootProps()} className="relative min-h-screen">
            <input {...getInputProps()} />

            {/* Drag overlay */}
            {isDragActive && (
                <div className="fixed inset-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center p-12 rounded-3xl border-2 border-dashed border-violet-500/50 bg-violet-500/5 max-w-md mx-4">
                        <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <svg
                                className="w-10 h-10 text-violet-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Drop files here</h3>
                        <p className="text-gray-400 text-sm">
                            Release to upload • Max 50MB per file
                        </p>
                    </div>
                </div>
            )}

            {children}
        </div>
    );
}
