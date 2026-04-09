-- V11__chat_soft_delete.sql
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS deleted_by_worker BOOLEAN DEFAULT FALSE;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS deleted_by_employer BOOLEAN DEFAULT FALSE;
