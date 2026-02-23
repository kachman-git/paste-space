import { supabase } from './supabase';

const BUCKET_NAME = 'space-files';

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
    spaceId: string,
    file: File
): Promise<{ path: string; url: string } | null> {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${spaceId}/${timestamp}_${safeName}`;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Upload error:', error);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

    return {
        path,
        url: urlData.publicUrl,
    };
}

/**
 * Get a public URL for a stored file
 */
export function getFileUrl(storagePath: string): string {
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);
    return data.publicUrl;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(storagePath: string): Promise<boolean> {
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([storagePath]);

    if (error) {
        console.error('Delete error:', error);
        return false;
    }
    return true;
}
