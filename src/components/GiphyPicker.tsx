'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

interface GiphyPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (gifUrl: string) => void;
}

interface GiphyGif {
    id: string;
    images: {
        fixed_height: { url: string; width: string; height: string };
        original: { url: string };
        fixed_width_small: { url: string };
    };
    title: string;
}

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || '';

export function GiphyPicker({ isOpen, onClose, onSelect }: GiphyPickerProps) {
    const [query, setQuery] = useState('');
    const [gifs, setGifs] = useState<GiphyGif[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Load trending on open
    useEffect(() => {
        if (isOpen && GIPHY_API_KEY) {
            fetchTrending();
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const fetchTrending = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`);
            const data = await res.json();
            setGifs(data.data || []);
        } catch {
            setGifs([]);
        } finally {
            setLoading(false);
        }
    };

    const searchGifs = useCallback(async (q: string) => {
        if (!q.trim() || !GIPHY_API_KEY) {
            fetchTrending();
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=20&rating=g`);
            const data = await res.json();
            setGifs(data.data || []);
        } catch {
            setGifs([]);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchGifs(value), 400);
    };

    const handleSelect = (gif: GiphyGif) => {
        onSelect(gif.images.original.url);
        onClose();
        setQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative theme-card rounded-3xl p-6 max-w-lg w-full animate-fade-in-up max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold theme-text">Search GIFs</h3>
                    <button onClick={onClose} className="p-2 rounded-xl theme-card-hover transition-all">
                        <svg className="w-4 h-4 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {!GIPHY_API_KEY ? (
                    <div className="text-center py-12">
                        <p className="theme-muted text-sm">Giphy API key not configured.</p>
                        <p className="theme-faint text-xs mt-1">Add NEXT_PUBLIC_GIPHY_API_KEY to .env.local</p>
                    </div>
                ) : (
                    <>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Search for GIFs..."
                            className="w-full px-4 py-2.5 rounded-xl theme-input text-sm mb-4"
                        />

                        <div className="flex-1 overflow-y-auto min-h-0">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                                </div>
                            ) : gifs.length === 0 ? (
                                <p className="text-center theme-muted text-sm py-8">No GIFs found</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {gifs.map((gif) => (
                                        <button
                                            key={gif.id}
                                            onClick={() => handleSelect(gif)}
                                            className="rounded-xl overflow-hidden hover:ring-2 hover:ring-violet-500 transition-all"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={gif.images.fixed_height.url}
                                                alt={gif.title}
                                                className="w-full h-auto"
                                                loading="lazy"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <p className="text-center text-xs theme-faint mt-3">Powered by GIPHY</p>
                    </>
                )}
            </div>
        </div>
    );
}
