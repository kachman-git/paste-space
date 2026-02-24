import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const expectedSecret = process.env.CLEANUP_SECRET;

        if (!expectedSecret || secret !== expectedSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getServerSupabase();

        // Find expired spaces
        const { data: expired, error: fetchError } = await supabase
            .from('spaces')
            .select('id')
            .lt('expires_at', new Date().toISOString())
            .not('expires_at', 'is', null);

        if (fetchError) {
            return NextResponse.json({ error: 'Failed to fetch expired spaces' }, { status: 500 });
        }

        if (!expired || expired.length === 0) {
            return NextResponse.json({ deleted: 0, message: 'No expired spaces found' });
        }

        const ids = expired.map((s) => s.id);

        // Delete storage files for items in expired spaces
        for (const spaceId of ids) {
            const { data: items } = await supabase
                .from('items')
                .select('storage_path')
                .eq('space_id', spaceId)
                .not('storage_path', 'is', null);

            if (items && items.length > 0) {
                const paths = items.map((i) => i.storage_path).filter(Boolean) as string[];
                if (paths.length > 0) {
                    await supabase.storage.from('space-files').remove(paths);
                }
            }
        }

        // Delete spaces (cascade will remove items and reactions)
        const { error: deleteError } = await supabase
            .from('spaces')
            .delete()
            .in('id', ids);

        if (deleteError) {
            return NextResponse.json({ error: 'Failed to delete spaces' }, { status: 500 });
        }

        return NextResponse.json({ deleted: ids.length, message: `Deleted ${ids.length} expired spaces` });
    } catch (err) {
        console.error('Cleanup error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
