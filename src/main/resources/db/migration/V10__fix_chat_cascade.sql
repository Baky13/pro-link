-- V10__fix_chat_cascade.sql
-- Исправляем каскадное удаление чатов при удалении откликов

ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_application_id_fkey;

ALTER TABLE chat_rooms
    ADD CONSTRAINT chat_rooms_application_id_fkey
    FOREIGN KEY (application_id)
    REFERENCES applications(id)
    ON DELETE SET NULL;
