import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const supabase = getServerSupabase();
        const body = await request.json();
        const { item_id, reason } = body;

        if (!item_id) {
            return NextResponse.json({ error: 'item_id is required' }, { status: 400 });
        }

        // Log report (in production, save to a reports table)
        console.log(`[REPORT] Item ${item_id} reported. Reason: ${reason || 'No reason given'}`);

        // Optionally, flag the item in the database
        const { error } = await supabase
            .from('items')
            .select('id')
            .eq('id', item_id)
            .single();

        if (error) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Report received' });
    } catch (err) {
        console.error('Report error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
