import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const supabase = getServerSupabase();
        const body = await request.json();
        const { space_id, type, content, storage_path, file_name, file_size, language } = body;

        if (!space_id || !type) {
            return NextResponse.json(
                { error: 'space_id and type are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('items')
            .insert({
                space_id,
                type,
                content: content || null,
                storage_path: storage_path || null,
                file_name: file_name || null,
                file_size: file_size || null,
                language: language || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Create item error:', error);
            return NextResponse.json(
                { error: 'Failed to create item' },
                { status: 500 }
            );
        }

        return NextResponse.json({ item: data });
    } catch (err) {
        console.error('Create item error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = getServerSupabase();
        const { searchParams } = new URL(request.url);
        const spaceId = searchParams.get('space_id');

        if (!spaceId) {
            return NextResponse.json(
                { error: 'space_id is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('space_id', spaceId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Fetch items error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch items' },
                { status: 500 }
            );
        }

        return NextResponse.json({ items: data });
    } catch (err) {
        console.error('Fetch items error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
