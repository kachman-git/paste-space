import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'anonymous';
        const limit = rateLimit(`reactions-post:${ip}`, 60, 60_000);
        if (!limit.success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const supabase = getServerSupabase();
        const body = await request.json();
        const { item_id, space_id, emoji, action } = body;

        if (!item_id || !emoji || !action) {
            return NextResponse.json({ error: 'item_id, emoji, and action are required' }, { status: 400 });
        }

        if (action === 'add') {
            // Upsert: increment count or create
            const { data: existing } = await supabase
                .from('reactions')
                .select('id, count')
                .eq('item_id', item_id)
                .eq('emoji', emoji)
                .single();

            if (existing) {
                await supabase
                    .from('reactions')
                    .update({ count: existing.count + 1 })
                    .eq('id', existing.id);
            } else {
                await supabase
                    .from('reactions')
                    .insert({ item_id, space_id, emoji, count: 1 });
            }
        } else if (action === 'remove') {
            const { data: existing } = await supabase
                .from('reactions')
                .select('id, count')
                .eq('item_id', item_id)
                .eq('emoji', emoji)
                .single();

            if (existing) {
                if (existing.count <= 1) {
                    await supabase.from('reactions').delete().eq('id', existing.id);
                } else {
                    await supabase
                        .from('reactions')
                        .update({ count: existing.count - 1 })
                        .eq('id', existing.id);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Reaction error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('item_id');

        if (!itemId) {
            return NextResponse.json({ error: 'item_id is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('reactions')
            .select('emoji, count')
            .eq('item_id', itemId)
            .gt('count', 0);

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
        }

        return NextResponse.json({ reactions: data || [] });
    } catch (err) {
        console.error('Fetch reactions error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
