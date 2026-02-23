import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
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
        const supabase = getServerSupabase();
        const body = await request.json();
        const { name, is_secret, passphrase, expires_in } = body;

        const slug = nanoid(8);
        let password_hash: string | null = null;

        if (is_secret && passphrase) {
            password_hash = await bcrypt.hash(passphrase, 10);
        }

        const expires_at = getExpiresAt(expires_in);

        const { data, error } = await supabase
            .from('spaces')
            .insert({
                slug,
                name: name || null,
                is_secret: is_secret || false,
                password_hash,
                expires_at,
            })
            .select()
            .single();

        if (error) {
            console.error('Create space error:', error);
            return NextResponse.json(
                { error: 'Failed to create space' },
                { status: 500 }
            );
        }

        return NextResponse.json({ space: data, slug: data.slug });
    } catch (err) {
        console.error('Create space error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
