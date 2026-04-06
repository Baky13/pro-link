-- V3__prolink_features.sql

CREATE TYPE job_search_status AS ENUM ('ACTIVELY_LOOKING', 'OPEN_TO_OFFERS', 'NOT_LOOKING');
CREATE TYPE complaint_reason AS ENUM ('FAKE_VACANCY', 'NO_PAYMENT', 'FRAUD', 'HARASSMENT', 'OTHER');
CREATE TYPE exit_reason AS ENUM ('LOW_SALARY', 'BAD_MANAGEMENT', 'NO_GROWTH', 'TOXIC_CULTURE', 'RELOCATION', 'OTHER');

-- Job search status + urgency hint for worker
ALTER TABLE worker_profiles
    ADD COLUMN job_search_status job_search_status DEFAULT 'OPEN_TO_OFFERS',
    ADD COLUMN available_from    DATE;

-- Urgent vacancy + auto-reject settings + response deadline
ALTER TABLE vacancies
    ADD COLUMN is_urgent              BOOLEAN   DEFAULT FALSE,
    ADD COLUMN response_deadline_days INTEGER   DEFAULT 7,
    ADD COLUMN auto_reject_enabled    BOOLEAN   DEFAULT FALSE,
    ADD COLUMN auto_reject_min_exp    INTEGER,
    ADD COLUMN auto_reject_min_salary INTEGER,
    ADD COLUMN applicants_count       INTEGER   DEFAULT 0;

-- Track when vacancy was re-opened for repeat-apply notifications
ALTER TABLE vacancies
    ADD COLUMN last_reopened_at TIMESTAMP;

-- Company complaints (black list)
CREATE TABLE company_complaints (
    id          BIGSERIAL PRIMARY KEY,
    employer_id BIGINT NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason      complaint_reason NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE (employer_id, reporter_id)
);

-- Auto-increment complaints count on employer
ALTER TABLE employer_profiles
    ADD COLUMN complaints_count INTEGER DEFAULT 0,
    ADD COLUMN is_blacklisted   BOOLEAN DEFAULT FALSE;

-- Exit reasons (why employees left)
CREATE TABLE company_exit_reasons (
    id          BIGSERIAL PRIMARY KEY,
    employer_id BIGINT NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason      exit_reason NOT NULL,
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE (employer_id, user_id)
);

-- Salary stats for calculator
CREATE TABLE salary_stats (
    id             BIGSERIAL PRIMARY KEY,
    category_id    BIGINT REFERENCES categories(id),
    city           VARCHAR(100),
    experience_min INTEGER NOT NULL DEFAULT 0,
    experience_max INTEGER NOT NULL DEFAULT 100,
    salary_avg     INTEGER NOT NULL,
    salary_min     INTEGER NOT NULL,
    salary_max     INTEGER NOT NULL,
    updated_at     TIMESTAMP DEFAULT NOW()
);

-- Notification for stale application (7 days no response)
ALTER TABLE notifications
    ALTER COLUMN type TYPE VARCHAR(50);

DROP TYPE IF EXISTS notification_type;
CREATE TYPE notification_type AS ENUM (
    'APPLICATION_STATUS',
    'NEW_MESSAGE',
    'NEW_VACANCY',
    'REVIEW',
    'STALE_APPLICATION',
    'VACANCY_REOPENED',
    'COMPANY_BLACKLISTED',
    'RESPONSE_DEADLINE_WARNING'
);

ALTER TABLE notifications
    ALTER COLUMN type TYPE notification_type USING type::notification_type;

-- Indexes
CREATE INDEX idx_company_complaints_employer ON company_complaints(employer_id);
CREATE INDEX idx_exit_reasons_employer ON company_exit_reasons(employer_id);
CREATE INDEX idx_salary_stats_category ON salary_stats(category_id);
CREATE INDEX idx_vacancies_urgent ON vacancies(is_urgent) WHERE is_urgent = TRUE;
CREATE INDEX idx_worker_search_status ON worker_profiles(job_search_status);
