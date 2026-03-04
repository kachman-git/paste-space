import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthUser } from '@/lib/supabase-auth';

export async function GET(request: NextRequest) {
    try {
        // Require authentication
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const supabase = getServerSupabase();

        // Fetch spaces owned by the current user
        const { data: spaces, error } = await supabase
            .from('spaces')
            .select('id, slug, name, created_at, view_count, is_secret, expires_at')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Fetch user spaces error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch spaces' },
                { status: 500 }
            );
        }

        // Get item counts for each space
        const spacesWithCounts = await Promise.all(
            (spaces || []).map(async (space) => {
                const { count } = await supabase
                    .from('items')
                    .select('*', { count: 'exact', head: true })
                    .eq('space_id', space.id);
                return {
                    ...space,
                    item_count: count || 0,
                };
            })
        );

        return NextResponse.json({ spaces: spacesWithCounts });
    } catch (err) {
        console.error('My spaces error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
