-- ============================================================
-- PasteSpace — Supabase Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create custom enum for item types
CREATE TYPE item_type AS ENUM ('text', 'image', 'file', 'gif', 'url', 'code');

-- 3. Spaces table
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT,
  is_secret BOOLEAN DEFAULT FALSE,
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slug lookups
CREATE INDEX idx_spaces_slug ON spaces (slug);

-- Index for cleaning up expired spaces
CREATE INDEX idx_spaces_expires_at ON spaces (expires_at) WHERE expires_at IS NOT NULL;

-- 4. Items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  type item_type NOT NULL,
  content TEXT,
  storage_path TEXT,
  file_name TEXT,
  file_size BIGINT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching items by space
CREATE INDEX idx_items_space_id ON items (space_id);
CREATE INDEX idx_items_created_at ON items (space_id, created_at);

-- 5. Row Level Security (RLS)

-- Enable RLS on both tables
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Spaces: anyone can read any space (secret check is app-level)
CREATE POLICY "spaces_select_all" ON spaces
  FOR SELECT USING (true);

-- Spaces: anyone can create spaces
CREATE POLICY "spaces_insert_all" ON spaces
  FOR INSERT WITH CHECK (true);

-- Spaces: anyone can delete spaces (for cleanup)
CREATE POLICY "spaces_delete_all" ON spaces
  FOR DELETE USING (true);

-- Items: anyone can read items (access gated app-side for secret spaces)
CREATE POLICY "items_select_all" ON items
  FOR SELECT USING (true);

-- Items: anyone can insert items
CREATE POLICY "items_insert_all" ON items
  FOR INSERT WITH CHECK (true);

-- Items: anyone can delete items
CREATE POLICY "items_delete_all" ON items
  FOR DELETE USING (true);

-- 6. Enable Realtime on items table
ALTER PUBLICATION supabase_realtime ADD TABLE items;

-- 7. Storage Buckets (run these separately if needed)
-- Note: Supabase storage buckets are typically created via the dashboard,
-- but you can also create them via SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES ('space-files', 'space-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for space-files bucket
CREATE POLICY "space_files_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'space-files');

CREATE POLICY "space_files_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'space-files');

CREATE POLICY "space_files_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'space-files');
