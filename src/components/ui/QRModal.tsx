'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCodeLib from 'qrcode';

interface QRModalProps {
    url: string;
    isOpen: boolean;
    onClose: () => void;
}

export function QRModal({ url, isOpen, onClose }: QRModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            QRCodeLib.toCanvas(canvasRef.current, url, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#ffffff',
                    light: '#00000000',
                },
            }).catch(() => setError(true));
        }
    }, [isOpen, url]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative theme-card rounded-3xl p-8 max-w-sm w-full text-center animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl theme-card-hover transition-all"
                >
                    <svg className="w-4 h-4 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-lg font-semibold theme-text mb-2">Scan to join</h3>
                <p className="text-sm theme-muted mb-6">Point your camera at the QR code to open this space</p>

                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
                        {error ? (
                            <div className="w-64 h-64 flex items-center justify-center theme-muted text-sm">
                                Failed to generate QR code
                            </div>
                        ) : (
                            <canvas ref={canvasRef} className="rounded-xl" />
                        )}
                    </div>
                </div>

                <p className="text-xs theme-faint font-mono break-all">{url}</p>
            </div>
        </div>
    );
}
