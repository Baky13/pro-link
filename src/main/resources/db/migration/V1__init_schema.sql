-- V1__init_schema.sql

CREATE TYPE user_role AS ENUM ('WORKER', 'EMPLOYER', 'ADMIN');
CREATE TYPE application_status AS ENUM ('PENDING', 'VIEWED', 'INVITED', 'REJECTED');
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'REMOTE', 'FREELANCE', 'INTERNSHIP');
CREATE TYPE notification_type AS ENUM ('APPLICATION_STATUS', 'NEW_MESSAGE', 'NEW_VACANCY', 'REVIEW');

-- Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'WORKER',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    city VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    parent_id BIGINT REFERENCES categories(id)
);

-- Worker profiles
CREATE TABLE worker_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    bio TEXT,
    resume_url VARCHAR(500),
    github_url VARCHAR(300),
    portfolio_url VARCHAR(300),
    linkedin_url VARCHAR(300),
    expected_salary INTEGER,
    is_open_to_work BOOLEAN DEFAULT TRUE,
    experience_years INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Worker skills
CREATE TABLE worker_skills (
    id BIGSERIAL PRIMARY KEY,
    worker_id BIGINT NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL
);

-- Worker experience
CREATE TABLE work_experience (
    id BIGSERIAL PRIMARY KEY,
    worker_id BIGINT NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    position VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE
);

-- Employer profiles
CREATE TABLE employer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    description TEXT,
    website VARCHAR(300),
    logo_url VARCHAR(500),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    founded_year INTEGER,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vacancies
CREATE TABLE vacancies (
    id BIGSERIAL PRIMARY KEY,
    employer_id BIGINT NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id),
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    salary_from INTEGER,
    salary_to INTEGER,
    currency VARCHAR(10) DEFAULT 'KZT',
    city VARCHAR(100),
    address VARCHAR(300),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    employment_type employment_type DEFAULT 'FULL_TIME',
    is_hot BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Vacancy skills
CREATE TABLE vacancy_skills (
    id BIGSERIAL PRIMARY KEY,
    vacancy_id BIGINT NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL
);

-- Applications (отклики)
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    vacancy_id BIGINT NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    worker_id BIGINT NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status application_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(vacancy_id, worker_id)
);

-- Saved vacancies
CREATE TABLE saved_vacancies (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vacancy_id BIGINT NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, vacancy_id)
);

-- Chat rooms
CREATE TABLE chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    worker_id BIGINT NOT NULL REFERENCES users(id),
    employer_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    reference_id BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Employer reviews
CREATE TABLE employer_reviews (
    id BIGSERIAL PRIMARY KEY,
    employer_id BIGINT NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(employer_id, reviewer_id)
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vacancies_category ON vacancies(category_id);
CREATE INDEX idx_vacancies_employer ON vacancies(employer_id);
CREATE INDEX idx_vacancies_city ON vacancies(city);
CREATE INDEX idx_vacancies_hot ON vacancies(is_hot) WHERE is_hot = TRUE;
CREATE INDEX idx_vacancies_active ON vacancies(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_applications_worker ON applications(worker_id);
CREATE INDEX idx_applications_vacancy ON applications(vacancy_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
