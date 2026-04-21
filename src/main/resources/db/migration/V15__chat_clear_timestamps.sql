ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS worker_cleared_at TIMESTAMP;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS employer_cleared_at TIMESTAMP;
