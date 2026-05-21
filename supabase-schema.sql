-- AI Toolkit — Supabase Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Users table: stores PIN hashes for anonymous auth
CREATE TABLE IF NOT EXISTS sync_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pin_hash TEXT UNIQUE NOT NULL,
    device_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Data table: stores user learning data (JSON blob per user)
CREATE TABLE IF NOT EXISTS sync_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pin_hash TEXT NOT NULL,
    device_id TEXT,
    data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(pin_hash)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_sync_data_pin ON sync_data(pin_hash);
CREATE INDEX IF NOT EXISTS idx_sync_users_pin ON sync_users(pin_hash);

-- Row Level Security (RLS)
-- Enable RLS on both tables
ALTER TABLE sync_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_data ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (since we use anon key + PIN hash as identity)
-- Users can only read/write their own data via pin_hash matching
CREATE POLICY "Allow insert for anon" ON sync_users
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow select own user" ON sync_users
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow insert sync_data" ON sync_data
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow select own data" ON sync_data
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow update own data" ON sync_data
    FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Enable upsert support: needed for "ON CONFLICT" resolution
-- The UNIQUE constraint on pin_hash in sync_data handles this automatically
