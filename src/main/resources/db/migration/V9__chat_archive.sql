-- V9__chat_archive.sql
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
