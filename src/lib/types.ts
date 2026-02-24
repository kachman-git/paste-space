export type ItemType = 'text' | 'image' | 'file' | 'gif' | 'url' | 'code';

export interface Space {
    id: string;
    slug: string;
    name: string | null;
    is_secret: boolean;
    password_hash: string | null;
    expires_at: string | null;
    created_at: string;
}

export interface Item {
    id: string;
    space_id: string;
    type: ItemType;
    content: string | null;
    storage_path: string | null;
    file_name: string | null;
    file_size: number | null;
    language: string | null;
    position: number;
    is_pinned: boolean;
    created_at: string;
}

export interface CreateSpaceRequest {
    name?: string;
    is_secret?: boolean;
    passphrase?: string;
    expires_in?: '1h' | '24h' | '7d' | 'permanent';
}

export interface CreateSpaceResponse {
    space: Space;
    slug: string;
}

export interface VerifyPassphraseRequest {
    passphrase: string;
}

export interface CreateItemRequest {
    space_id: string;
    type: ItemType;
    content?: string;
    storage_path?: string;
    file_name?: string;
    file_size?: number;
    language?: string;
}
