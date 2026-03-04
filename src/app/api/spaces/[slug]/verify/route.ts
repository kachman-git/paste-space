import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        // Rate limit: 5 attempts per minute per IP to prevent brute-force
        const ip = request.headers.get('x-forwarded-for') || 'anonymous';
        const limit = rateLimit(`verify:${ip}`, 5, 60_000);
        if (!limit.success) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const supabase = getServerSupabase();
        const { slug } = await params;
        const body = await request.json();
        const { passphrase } = body;

        if (!passphrase) {
            return NextResponse.json(
                { error: 'Passphrase is required' },
                { status: 400 }
            );
        }

        const { data: space, error } = await supabase
            .from('spaces')
            .select('id, password_hash, is_secret')
            .eq('slug', slug)
            .single();

        if (error || !space) {
            return NextResponse.json(
                { error: 'Space not found' },
                { status: 404 }
            );
        }

        if (!space.is_secret || !space.password_hash) {
            return NextResponse.json(
                { error: 'Space is not secret' },
                { status: 400 }
            );
        }

        const isValid = await bcrypt.compare(passphrase, space.password_hash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid passphrase' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            space_id: space.id,
        });
    } catch (err) {
        console.error('Verify passphrase error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
