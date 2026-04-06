-- V5__seed_demo_data.sql
-- Пароль для всех: password123 (BCrypt hash)

INSERT INTO users (email, password, role, first_name, last_name, phone, city, is_active, email_verified) VALUES
('employer1@prolink.kg', '$2a$10$N.zmdr9zkoa05OYx/PmDNOiLIBNFSGKGaGGGGGGGGGGGGGGGGGGGG', 'EMPLOYER', 'Азамат', 'Бейшенов', '+996700111111', 'Бишкек', true, true),
('employer2@prolink.kg', '$2a$10$N.zmdr9zkoa05OYx/PmDNOiLIBNFSGKGaGGGGGGGGGGGGGGGGGGGG', 'EMPLOYER', 'Айгуль', 'Токтосунова', '+996700222222', 'Бишкек', true, true),
('worker1@prolink.kg',   '$2a$10$N.zmdr9zkoa05OYx/PmDNOiLIBNFSGKGaGGGGGGGGGGGGGGGGGGGG', 'WORKER',   'Бакыт', 'Мамытов',     '+996700333333', 'Бишкек', true, true),
('worker2@prolink.kg',   '$2a$10$N.zmdr9zkoa05OYx/PmDNOiLIBNFSGKGaGGGGGGGGGGGGGGGGGGGG', 'WORKER',   'Нурзат', 'Алиева',      '+996700444444', 'Ош',     true, true);

-- Employer profiles
INSERT INTO employer_profiles (user_id, company_name, description, website, industry, company_size, founded_year, rating, reviews_count, is_verified)
SELECT id, 'TechBishkek', 'Ведущая IT компания Кыргызстана. Разрабатываем мобильные и веб приложения для клиентов по всему миру.', 'https://techbishkek.kg', 'IT', '50-100', 2018, 4.5, 12, true
FROM users WHERE email = 'employer1@prolink.kg';

INSERT INTO employer_profiles (user_id, company_name, description, website, industry, company_size, founded_year, rating, reviews_count, is_verified)
SELECT id, 'FinTech KG', 'Финтех стартап. Создаём платёжные решения для малого бизнеса в Центральной Азии.', 'https://fintechkg.com', 'Финансы', '10-50', 2021, 4.2, 5, false
FROM users WHERE email = 'employer2@prolink.kg';

-- Worker profiles
INSERT INTO worker_profiles (user_id, title, bio, expected_salary, is_open_to_work, experience_years, job_search_status)
SELECT id, 'Frontend разработчик', 'Опытный React разработчик с 3 годами опыта. Люблю создавать красивые и быстрые интерфейсы.', 80000, true, 3, 'ACTIVELY_LOOKING'
FROM users WHERE email = 'worker1@prolink.kg';

INSERT INTO worker_profiles (user_id, title, bio, expected_salary, is_open_to_work, experience_years, job_search_status)
SELECT id, 'Backend разработчик', 'Java Spring Boot разработчик. Опыт работы с микросервисами и PostgreSQL.', 100000, true, 5, 'OPEN_TO_OFFERS'
FROM users WHERE email = 'worker2@prolink.kg';

-- Worker skills
INSERT INTO worker_skills (worker_id, skill_name)
SELECT wp.id, s.skill FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
CROSS JOIN (VALUES ('React'), ('JavaScript'), ('TypeScript'), ('CSS'), ('Git')) AS s(skill)
WHERE u.email = 'worker1@prolink.kg';

INSERT INTO worker_skills (worker_id, skill_name)
SELECT wp.id, s.skill FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
CROSS JOIN (VALUES ('Java'), ('Spring Boot'), ('PostgreSQL'), ('Docker'), ('REST API')) AS s(skill)
WHERE u.email = 'worker2@prolink.kg';

-- Vacancies
INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, employment_type, is_hot, is_urgent, is_active, response_deadline_days, auto_reject_enabled, applicants_count, views_count)
SELECT
    ep.id,
    (SELECT id FROM categories WHERE slug = 'frontend'),
    'Frontend разработчик (React)',
    'Ищем опытного Frontend разработчика для работы над нашими продуктами. Вы будете работать в команде из 5 человек над интересными проектами для международных клиентов.',
    'Опыт работы с React от 2 лет. Знание TypeScript, CSS/SCSS. Умение работать в команде.',
    60000, 100000, 'KGS', 'Бишкек', 'FULL_TIME', true, false, true, 7, true, 8, 45
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'employer1@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, employment_type, is_hot, is_urgent, is_active, response_deadline_days, auto_reject_enabled, auto_reject_min_exp, applicants_count, views_count)
SELECT
    ep.id,
    (SELECT id FROM categories WHERE slug = 'backend'),
    'Backend разработчик (Java)',
    'TechBishkek ищет Senior Backend разработчика. Работа над высоконагруженными системами. Гибкий график, удалённая работа возможна.',
    'Java 11+, Spring Boot, PostgreSQL, Docker. Опыт от 3 лет.',
    90000, 150000, 'KGS', 'Бишкек', 'REMOTE', true, true, true, 5, true, 3, 12, 67
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'employer1@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, employment_type, is_hot, is_urgent, is_active, response_deadline_days, auto_reject_enabled, applicants_count, views_count)
SELECT
    ep.id,
    (SELECT id FROM categories WHERE slug = 'fullstack'),
    'Fullstack разработчик',
    'FinTech KG ищет Fullstack разработчика для разработки платёжной платформы. Интересные задачи, молодая команда, equity опцион.',
    'React + Node.js или React + Java. Опыт от 2 лет.',
    70000, 120000, 'KGS', 'Бишкек', 'FULL_TIME', false, true, true, 3, false, 3, 28
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'employer2@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, employment_type, is_hot, is_urgent, is_active, response_deadline_days, auto_reject_enabled, applicants_count, views_count)
SELECT
    ep.id,
    (SELECT id FROM categories WHERE slug = 'qa'),
    'QA инженер',
    'Ищем QA инженера для тестирования мобильного приложения. Ручное и автоматизированное тестирование.',
    'Опыт ручного тестирования от 1 года. Знание Postman, Jira.',
    40000, 65000, 'KGS', 'Бишкек', 'FULL_TIME', false, false, true, 7, false, 2, 19
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'employer1@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, employment_type, is_hot, is_urgent, is_active, response_deadline_days, auto_reject_enabled, applicants_count, views_count)
SELECT
    ep.id,
    (SELECT id FROM categories WHERE slug = 'mobile'),
    'Mobile разработчик (Flutter)',
    'Разработка кросс-платформенного мобильного приложения на Flutter. Удалённая работа.',
    'Flutter/Dart от 1 года. Опыт публикации в App Store / Google Play.',
    55000, 90000, 'KGS', 'Ош', 'REMOTE', true, false, true, 7, false, 5, 33
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'employer2@prolink.kg';

-- Vacancy skills
INSERT INTO vacancy_skills (vacancy_id, skill_name)
SELECT v.id, s.skill FROM vacancies v
CROSS JOIN (VALUES ('React'), ('TypeScript'), ('CSS'), ('Git'), ('REST API')) AS s(skill)
WHERE v.title = 'Frontend разработчик (React)';

INSERT INTO vacancy_skills (vacancy_id, skill_name)
SELECT v.id, s.skill FROM vacancies v
CROSS JOIN (VALUES ('Java'), ('Spring Boot'), ('PostgreSQL'), ('Docker'), ('Microservices')) AS s(skill)
WHERE v.title = 'Backend разработчик (Java)';

INSERT INTO vacancy_skills (vacancy_id, skill_name)
SELECT v.id, s.skill FROM vacancies v
CROSS JOIN (VALUES ('Flutter'), ('Dart'), ('Firebase'), ('REST API')) AS s(skill)
WHERE v.title = 'Mobile разработчик (Flutter)';

-- Employer reviews
INSERT INTO employer_reviews (employer_id, reviewer_id, rating, comment, is_anonymous)
SELECT ep.id, (SELECT id FROM users WHERE email = 'worker1@prolink.kg'), 5,
    'Отличная компания! Дружный коллектив, интересные задачи, вовремя платят зарплату.', false
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'employer1@prolink.kg';

INSERT INTO employer_reviews (employer_id, reviewer_id, rating, comment, is_anonymous)
SELECT ep.id, (SELECT id FROM users WHERE email = 'worker2@prolink.kg'), 4,
    'Хорошая компания для роста. Иногда бывают переработки, но платят за них.', true
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'employer1@prolink.kg';
