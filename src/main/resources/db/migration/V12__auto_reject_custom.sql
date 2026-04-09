-- V12__auto_reject_custom.sql
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS auto_reject_min_age INTEGER;
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS auto_reject_custom_criteria TEXT;
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
