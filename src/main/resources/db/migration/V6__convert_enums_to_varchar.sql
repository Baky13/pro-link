-- V6__convert_enums_to_varchar.sql

ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20) USING role::VARCHAR;
ALTER TABLE applications ALTER COLUMN status TYPE VARCHAR(20) USING status::VARCHAR;
ALTER TABLE vacancies ALTER COLUMN employment_type TYPE VARCHAR(20) USING employment_type::VARCHAR;
ALTER TABLE notifications ALTER COLUMN type TYPE VARCHAR(50) USING type::VARCHAR;
ALTER TABLE worker_profiles ALTER COLUMN job_search_status TYPE VARCHAR(30) USING job_search_status::VARCHAR;
ALTER TABLE company_complaints ALTER COLUMN reason TYPE VARCHAR(30) USING reason::VARCHAR;
ALTER TABLE company_exit_reasons ALTER COLUMN reason TYPE VARCHAR(30) USING reason::VARCHAR;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS employment_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS job_search_status CASCADE;
DROP TYPE IF EXISTS complaint_reason CASCADE;
DROP TYPE IF EXISTS exit_reason CASCADE;
