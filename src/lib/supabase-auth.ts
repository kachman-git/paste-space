import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

let _serviceClient: SupabaseClient | null = null;

/**
 * Get a Supabase client using the service_role key.
 * Use this for server-side admin operations (e.g. verifying JWTs).
 */
export function getServiceSupabase(): SupabaseClient {
    if (!_serviceClient) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !serviceKey) {
            throw new Error(
                'Missing SUPABASE_SERVICE_ROLE_KEY. Set it in .env.local (get it from Supabase Dashboard → Settings → API).'
            );
        }

        _serviceClient = createClient(url, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });
    }
    return _serviceClient;
}

/**
 * Extract the authenticated user from an incoming API request.
 * Checks the Authorization header (Bearer token) first, then falls back to cookies.
 * Returns null if no valid session found.
 */
export async function getAuthUser(request: NextRequest): Promise<User | null> {
    try {
        // 1. Check Authorization header
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7);
            const serviceClient = getServiceSupabase();
            const { data, error } = await serviceClient.auth.getUser(token);
            if (!error && data?.user) {
                return data.user;
            }
        }

        // 2. Check cookies for session token
        const accessToken = request.cookies.get('sb-access-token')?.value
            || request.cookies.get(`sb-${getSupabaseProjectRef()}-auth-token`)?.value;

        if (accessToken) {
            // The cookie might be a JSON-encoded array [access_token, refresh_token]
            let token = accessToken;
            try {
                const parsed = JSON.parse(accessToken);
                if (Array.isArray(parsed) && parsed[0]) {
                    token = parsed[0];
                }
            } catch {
                // Not JSON, use as-is
            }

            const serviceClient = getServiceSupabase();
            const { data, error } = await serviceClient.auth.getUser(token);
            if (!error && data?.user) {
                return data.user;
            }
        }

        return null;
    } catch (err) {
        console.error('getAuthUser error:', err);
        return null;
    }
}

/**
 * Extract the Supabase project reference from the URL.
 */
function getSupabaseProjectRef(): string {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    // URL format: https://<project-ref>.supabase.co
    const match = url.match(/https:\/\/([^.]+)\.supabase/);
    return match?.[1] || '';
}
