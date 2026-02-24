import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const supabase = getServerSupabase();
        const { slug } = await params;

        // Increment view_count
        const { data: space, error: fetchError } = await supabase
            .from('spaces')
            .select('id, view_count')
            .eq('slug', slug)
            .single();

        if (fetchError || !space) {
            return NextResponse.json({ error: 'Space not found' }, { status: 404 });
        }

        const { error } = await supabase
            .from('spaces')
            .update({ view_count: (space.view_count || 0) + 1 })
            .eq('id', space.id);

        if (error) {
            return NextResponse.json({ error: 'Failed to update view count' }, { status: 500 });
        }

        return NextResponse.json({ view_count: (space.view_count || 0) + 1 });
    } catch (err) {
        console.error('Analytics error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const supabase = getServerSupabase();
        const { slug } = await params;

        const { data, error } = await supabase
            .from('spaces')
            .select('view_count')
            .eq('slug', slug)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Space not found' }, { status: 404 });
        }

        return NextResponse.json({ view_count: data.view_count || 0 });
    } catch (err) {
        console.error('Analytics error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
