import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthUser } from '@/lib/supabase-auth';
import { rateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

function getExpiresAt(expiresIn?: string): string | null {
    if (!expiresIn || expiresIn === 'permanent') return null;
    const now = new Date();
    switch (expiresIn) {
        case '1h':
            now.setHours(now.getHours() + 1);
            return now.toISOString();
        case '24h':
            now.setHours(now.getHours() + 24);
            return now.toISOString();
        case '7d':
            now.setDate(now.getDate() + 7);
            return now.toISOString();
        default:
            return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'anonymous';
        const limit = rateLimit(`spaces-post:${ip}`, 10, 60_000);
        if (!limit.success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const supabase = getServerSupabase();
        const body = await request.json();
        const { name, is_secret, passphrase, expires_in } = body;

        // Input validation
        if (name && (typeof name !== 'string' || name.length > 100)) {
            return NextResponse.json(
                { error: 'Space name must be a string of 100 characters or less' },
                { status: 400 }
            );
        }

        if (is_secret && passphrase && (typeof passphrase !== 'string' || passphrase.length < 3)) {
            return NextResponse.json(
                { error: 'Passphrase must be at least 3 characters' },
                { status: 400 }
            );
        }

        const validExpiry = ['1h', '24h', '7d', 'permanent', undefined];
        if (expires_in && !validExpiry.includes(expires_in)) {
            return NextResponse.json(
                { error: 'Invalid expiry value' },
                { status: 400 }
            );
        }

        const slug = nanoid(8);
        let password_hash: string | null = null;

        if (is_secret && passphrase) {
            password_hash = await bcrypt.hash(passphrase, 10);
        }

        const expires_at = getExpiresAt(expires_in);

        // Get authenticated user (optional — anonymous space creation is allowed)
        const user = await getAuthUser(request);

        const { data, error } = await supabase
            .from('spaces')
            .insert({
                slug,
                name: name || null,
                is_secret: is_secret || false,
                password_hash,
                expires_at,
                owner_id: user?.id || null,
            })
            .select('id, slug, name, is_secret, expires_at, created_at, owner_id, view_count')
            .single();

        if (error) {
            console.error('Create space error:', error);
            return NextResponse.json(
                { error: 'Failed to create space' },
                { status: 500 }
            );
        }

        // Return space WITHOUT password_hash
        return NextResponse.json({ space: data, slug: data.slug });
    } catch (err) {
        console.error('Create space error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
