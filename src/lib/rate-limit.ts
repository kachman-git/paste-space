/**
 * Simple in-memory sliding window rate limiter.
 * Suitable for serverless / edge functions.
 */

interface RateLimitEntry {
    timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    const cutoff = now - windowMs;
    for (const [key, entry] of store.entries()) {
        entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
        if (entry.timestamps.length === 0) store.delete(key);
    }
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number; // ms until next window
}

/**
 * Check rate limit for a given key.
 * @param key - Unique identifier (e.g. IP address)
 * @param maxRequests - Max requests allowed per window
 * @param windowMs - Window size in milliseconds (default: 60s)
 */
export function rateLimit(
    key: string,
    maxRequests: number = 30,
    windowMs: number = 60_000
): RateLimitResult {
    const now = Date.now();
    cleanup(windowMs);

    let entry = store.get(key);
    if (!entry) {
        entry = { timestamps: [] };
        store.set(key, entry);
    }

    // Remove timestamps outside the window
    const cutoff = now - windowMs;
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

    const remaining = Math.max(0, maxRequests - entry.timestamps.length);
    const resetIn = entry.timestamps.length > 0
        ? entry.timestamps[0] + windowMs - now
        : windowMs;

    if (entry.timestamps.length >= maxRequests) {
        return { success: false, remaining: 0, resetIn };
    }

    entry.timestamps.push(now);
    return { success: true, remaining: remaining - 1, resetIn };
}
