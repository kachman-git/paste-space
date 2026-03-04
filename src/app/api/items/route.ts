import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';
import { checkContent } from '@/lib/moderation';

export async function POST(request: NextRequest) {
    try {
        // Rate limit
        const ip = request.headers.get('x-forwarded-for') || 'anonymous';
        const limit = rateLimit(`items-post:${ip}`, 30, 60_000);
        if (!limit.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please slow down.' },
                { status: 429 }
            );
        }

        const supabase = getServerSupabase();
        const body = await request.json();
        const { space_id, type, content, storage_path, file_name, file_size, language } = body;

        if (!space_id || !type) {
            return NextResponse.json(
                { error: 'space_id and type are required' },
                { status: 400 }
            );
        }

        // Validate type against allowed values
        const allowedTypes = ['text', 'image', 'file', 'gif', 'url', 'code'];
        if (!allowedTypes.includes(type)) {
            return NextResponse.json(
                { error: `Invalid type. Allowed: ${allowedTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Limit text content to 100KB
        if (content && typeof content === 'string' && content.length > 102_400) {
            return NextResponse.json(
                { error: 'Content too large. Maximum 100KB for text content.' },
                { status: 413 }
            );
        }

        // Validate file_size if provided (max 50MB)
        if (file_size && (typeof file_size !== 'number' || file_size > 50 * 1024 * 1024)) {
            return NextResponse.json(
                { error: 'File size exceeds maximum of 50MB' },
                { status: 413 }
            );
        }

        // Content moderation for text items
        if (content && (type === 'text' || type === 'code')) {
            const mod = checkContent(content);
            if (!mod.clean) {
                return NextResponse.json(
                    { error: 'Content flagged by moderation', flagged: mod.flagged },
                    { status: 422 }
                );
            }
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
            .order('is_pinned', { ascending: false })
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

export async function PATCH(request: NextRequest) {
    try {
        const supabase = getServerSupabase();
        const body = await request.json();
        const { id, is_pinned, position } = body;

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const updates: Record<string, unknown> = {};
        if (typeof is_pinned === 'boolean') updates.is_pinned = is_pinned;
        if (typeof position === 'number') updates.position = position;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('items')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Update item error:', error);
            return NextResponse.json({ error: 'Failed to update item. Make sure the is_pinned and position columns exist in the items table.' }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ error: 'Item not found or no changes applied' }, { status: 404 });
        }

        return NextResponse.json({ item: data[0] });
    } catch (err) {
        console.error('Update item error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = getServerSupabase();
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('id');
        const spaceId = searchParams.get('space_id');

        if (itemId) {
            // Delete single item + its storage file
            const { data: item } = await supabase
                .from('items')
                .select('storage_path')
                .eq('id', itemId)
                .single();

            if (item?.storage_path) {
                await supabase.storage.from('space-files').remove([item.storage_path]);
            }

            const { error } = await supabase
                .from('items')
                .delete()
                .eq('id', itemId);

            if (error) {
                console.error('Delete item error:', error);
                return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
            }

            return NextResponse.json({ success: true });
        } else if (spaceId) {
            // Delete all items in a space + their storage files
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

            const { error } = await supabase
                .from('items')
                .delete()
                .eq('space_id', spaceId);

            if (error) {
                console.error('Delete all items error:', error);
                return NextResponse.json({ error: 'Failed to delete items' }, { status: 500 });
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'id or space_id is required' }, { status: 400 });
        }
    } catch (err) {
        console.error('Delete error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
