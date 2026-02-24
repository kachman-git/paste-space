'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
    showToast: () => { },
});

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counterRef = useRef(0);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = `toast-${++counterRef.current}`;
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), 3000);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const icons: Record<ToastType, React.ReactNode> = {
        success: (
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        ),
        error: (
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        info: (
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    const bgColors: Record<ToastType, string> = {
        success: 'border-emerald-500/20',
        error: 'border-red-500/20',
        info: 'border-blue-500/20',
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl theme-card ${bgColors[toast.type]} backdrop-blur-xl shadow-2xl animate-fade-in-up cursor-pointer`}
            onClick={() => onDismiss(toast.id)}
        >
            {icons[toast.type]}
            <span className="text-sm theme-text">{toast.message}</span>
        </div>
    );
}
