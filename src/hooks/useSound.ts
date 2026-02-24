'use client';

import { useCallback, useRef } from 'react';

export function useSound() {
    const enabledRef = useRef(true);
    const ctxRef = useRef<AudioContext | null>(null);

    const play = useCallback(() => {
        if (!enabledRef.current) return;
        try {
            if (!ctxRef.current) {
                ctxRef.current = new AudioContext();
            }
            const ctx = ctxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        } catch {
            // Web Audio not supported
        }
    }, []);

    const toggle = useCallback(() => {
        enabledRef.current = !enabledRef.current;
        return enabledRef.current;
    }, []);

    return { play, toggle, isEnabled: () => enabledRef.current };
}
