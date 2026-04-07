-- V5__seed_demo_data.sql
-- Пароль для всех аккаунтов: password123

INSERT INTO users (email, password, role, first_name, last_name, phone, city, is_active, email_verified) VALUES
('techbishkek@prolink.kg', '$2a$10$TQT1yHmlPjAOmDpkFjqQZufqPnZ2l9Mm8AIpELWpL2alYsF169P7m', 'EMPLOYER', 'Азамат', 'Бейшенов', '+996700111111', 'Бишкек', true, true),
('fintechkg@prolink.kg',   '$2a$10$TQT1yHmlPjAOmDpkFjqQZufqPnZ2l9Mm8AIpELWpL2alYsF169P7m', 'EMPLOYER', 'Айгуль', 'Токтосунова', '+996700222222', 'Бишкек', true, true),
('medcenter@prolink.kg',   '$2a$10$TQT1yHmlPjAOmDpkFjqQZufqPnZ2l9Mm8AIpELWpL2alYsF169P7m', 'EMPLOYER', 'Нурлан', 'Асанов', '+996700333333', 'Бишкек', true, true),
('worker1@prolink.kg',     '$2a$10$TQT1yHmlPjAOmDpkFjqQZufqPnZ2l9Mm8AIpELWpL2alYsF169P7m', 'WORKER', 'Бакыт', 'Мамытов', '+996700444444', 'Бишкек', true, true),
('worker2@prolink.kg',     '$2a$10$TQT1yHmlPjAOmDpkFjqQZufqPnZ2l9Mm8AIpELWpL2alYsF169P7m', 'WORKER', 'Нурзат', 'Алиева', '+996700555555', 'Ош', true, true);

-- Employer profiles
INSERT INTO employer_profiles (user_id, company_name, description, website, industry, company_size, founded_year, rating, reviews_count, is_verified)
SELECT id, 'TechBishkek', 'Ведущая IT компания Кыргызстана. Разрабатываем мобильные и веб приложения для клиентов по всему миру. Работаем с клиентами из США, Европы и СНГ.', 'https://techbishkek.kg', 'IT', '50-100', 2018, 4.5, 12, true
FROM users WHERE email = 'techbishkek@prolink.kg';

INSERT INTO employer_profiles (user_id, company_name, description, website, industry, company_size, founded_year, rating, reviews_count, is_verified)
SELECT id, 'FinTech KG', 'Финтех стартап нового поколения. Создаём платёжные решения для малого бизнеса в Центральной Азии. Молодая команда, equity опцион.', 'https://fintechkg.com', 'Финансы', '10-50', 2021, 4.2, 5, false
FROM users WHERE email = 'fintechkg@prolink.kg';

INSERT INTO employer_profiles (user_id, company_name, description, website, industry, company_size, founded_year, rating, reviews_count, is_verified)
SELECT id, 'МедЦентр Бишкек', 'Современный медицинский центр с полным спектром услуг. Работаем с 2010 года, более 50 000 пациентов.', 'https://medcenter.kg', 'Медицина', '100-500', 2010, 4.7, 28, true
FROM users WHERE email = 'medcenter@prolink.kg';

-- Worker profiles
INSERT INTO worker_profiles (user_id, title, bio, expected_salary, is_open_to_work, experience_years, job_search_status)
SELECT id, 'Frontend разработчик', 'Опытный React разработчик с 3 годами опыта. Люблю создавать красивые и быстрые интерфейсы. Работал в стартапах и крупных компаниях.', 80000, true, 3, 'ACTIVELY_LOOKING'
FROM users WHERE email = 'worker1@prolink.kg';

INSERT INTO worker_profiles (user_id, title, bio, expected_salary, is_open_to_work, experience_years, job_search_status)
SELECT id, 'Backend разработчик', 'Java Spring Boot разработчик с 5 годами опыта. Специализируюсь на высоконагруженных системах и микросервисной архитектуре.', 100000, true, 5, 'OPEN_TO_OFFERS'
FROM users WHERE email = 'worker2@prolink.kg';

-- Worker skills
INSERT INTO worker_skills (worker_id, skill_name)
SELECT wp.id, s.skill FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
CROSS JOIN (VALUES ('React'), ('TypeScript'), ('JavaScript'), ('CSS'), ('Git'), ('Figma')) AS s(skill)
WHERE u.email = 'worker1@prolink.kg';

INSERT INTO worker_skills (worker_id, skill_name)
SELECT wp.id, s.skill FROM worker_profiles wp
JOIN users u ON u.id = wp.user_id
CROSS JOIN (VALUES ('Java'), ('Spring Boot'), ('PostgreSQL'), ('Docker'), ('Kubernetes'), ('REST API')) AS s(skill)
WHERE u.email = 'worker2@prolink.kg';

-- Vacancies IT
INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, latitude, longitude, employment_type, is_hot, is_urgent, is_active, response_deadline_days, applicants_count, views_count)
SELECT ep.id, (SELECT id FROM categories WHERE slug = 'frontend'),
'Frontend разработчик (React)',
'Ищем опытного Frontend разработчика для работы над нашими продуктами. Вы будете работать в команде из 5 человек над интересными проектами для международных клиентов. Гибкий график, современный офис в центре Бишкека.',
'Опыт работы с React от 2 лет. Знание TypeScript, CSS/SCSS. Умение работать в команде. Английский язык — базовый.',
60000, 100000, 'KGS', 'Бишкек', 42.8746, 74.5698, 'FULL_TIME', true, false, true, 7, 8, 145
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'techbishkek@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, latitude, longitude, employment_type, is_hot, is_urgent, is_active, response_deadline_days, applicants_count, views_count)
SELECT ep.id, (SELECT id FROM categories WHERE slug = 'backend'),
'Backend разработчик (Java)',
'TechBishkek ищет Senior Backend разработчика. Работа над высоконагруженными системами обработки платежей. Удалённая работа возможна 3 дня в неделю.',
'Java 11+, Spring Boot, PostgreSQL, Docker. Опыт от 3 лет. Знание микросервисной архитектуры.',
90000, 150000, 'KGS', 'Бишкек', 42.8746, 74.5698, 'REMOTE', true, true, true, 5, 12, 267
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'techbishkek@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, latitude, longitude, employment_type, is_hot, is_urgent, is_active, response_deadline_days, applicants_count, views_count)
SELECT ep.id, (SELECT id FROM categories WHERE slug = 'fullstack'),
'Fullstack разработчик (React + Node.js)',
'FinTech KG ищет Fullstack разработчика для разработки платёжной платформы нового поколения. Интересные задачи, молодая команда, equity опцион для лучших кандидатов.',
'React + Node.js или React + Java. Опыт от 2 лет. Понимание финансовых систем — плюс.',
70000, 120000, 'KGS', 'Бишкек', 42.8700, 74.5900, 'FULL_TIME', false, true, true, 3, 3, 89
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'fintechkg@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, latitude, longitude, employment_type, is_hot, is_urgent, is_active, response_deadline_days, applicants_count, views_count)
SELECT ep.id, (SELECT id FROM categories WHERE slug = 'mobile'),
'Mobile разработчик (Flutter)',
'Разработка кросс-платформенного мобильного приложения для управления финансами. Полностью удалённая работа, гибкий график.',
'Flutter/Dart от 1 года. Опыт публикации в App Store / Google Play. Знание REST API.',
55000, 90000, 'KGS', 'Ош', 40.5283, 72.7985, 'REMOTE', true, false, true, 7, 5, 133
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'fintechkg@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, latitude, longitude, employment_type, is_hot, is_urgent, is_active, response_deadline_days, applicants_count, views_count)
SELECT ep.id, (SELECT id FROM categories WHERE slug = 'devops'),
'DevOps инженер',
'Ищем DevOps инженера для поддержки и развития нашей инфраструктуры. Kubernetes кластер, CI/CD пайплайны, мониторинг.',
'Docker, Kubernetes, CI/CD (GitLab/GitHub Actions). Linux. Опыт от 2 лет.',
80000, 130000, 'KGS', 'Бишкек', 42.8800, 74.5600, 'FULL_TIME', false, false, true, 7, 2, 56
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'techbishkek@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, latitude, longitude, employment_type, is_hot, is_urgent, is_active, response_deadline_days, applicants_count, views_count)
SELECT ep.id, (SELECT id FROM categories WHERE slug = 'qa'),
'QA инженер',
'Ищем QA инженера для тестирования мобильного и веб приложений. Ручное и автоматизированное тестирование. Работа в Agile команде.',
'Опыт ручного тестирования от 1 года. Знание Postman, Jira. Selenium — плюс.',
40000, 65000, 'KGS', 'Бишкек', 42.8746, 74.5698, 'FULL_TIME', false, false, true, 7, 2, 44
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'techbishkek@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, latitude, longitude, employment_type, is_hot, is_urgent, is_active, response_deadline_days, applicants_count, views_count)
SELECT ep.id, (SELECT id FROM categories WHERE slug = 'data-science'),
'Data Scientist / ML Engineer',
'Разработка моделей машинного обучения для анализа финансовых данных и предсказания рисков. Работа с большими данными.',
'Python, pandas, scikit-learn, TensorFlow/PyTorch. Опыт от 2 лет. Математическая база.',
100000, 180000, 'KGS', 'Бишкек', 42.8700, 74.5900, 'REMOTE', true, false, true, 10, 4, 98
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'fintechkg@prolink.kg';

-- Vacancies Medicine
INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, latitude, longitude, employment_type, is_hot, is_urgent, is_active, response_deadline_days, applicants_count, views_count)
SELECT ep.id, (SELECT id FROM categories WHERE slug = 'doctor'),
'Терапевт',
'МедЦентр Бишкек приглашает терапевта на постоянную работу. Современное оборудование, хороший коллектив, стабильная зарплата + % от приёма.',
'Высшее медицинское образование. Сертификат терапевта. Опыт от 2 лет.',
60000, 90000, 'KGS', 'Бишкек', 42.8650, 74.5750, 'FULL_TIME', true, true, true, 3, 6, 78
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'medcenter@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, latitude, longitude, employment_type, is_hot, is_urgent, is_active, response_deadline_days, applicants_count, views_count)
SELECT ep.id, (SELECT id FROM categories WHERE slug = 'dentist'),
'Стоматолог-терапевт',
'Приглашаем стоматолога в современную клинику. Новейшее оборудование, высокий поток пациентов, % от выручки.',
'Диплом стоматолога. Сертификат. Опыт от 1 года.',
70000, 120000, 'KGS', 'Бишкек', 42.8650, 74.5750, 'FULL_TIME', false, true, true, 5, 3, 52
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'medcenter@prolink.kg';

INSERT INTO vacancies (employer_id, category_id, title, description, requirements, salary_from, salary_to, currency, city, latitude, longitude, employment_type, is_hot, is_urgent, is_active, response_deadline_days, applicants_count, views_count)
SELECT ep.id, (SELECT id FROM categories WHERE slug = 'nurse'),
'Медсестра / медбрат',
'Требуется медсестра для работы в процедурном кабинете. График 2/2, полный соцпакет.',
'Среднее медицинское образование. Опыт работы приветствуется.',
30000, 45000, 'KGS', 'Бишкек', 42.8650, 74.5750, 'FULL_TIME', false, false, true, 7, 1, 23
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'medcenter@prolink.kg';

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

INSERT INTO vacancy_skills (vacancy_id, skill_name)
SELECT v.id, s.skill FROM vacancies v
CROSS JOIN (VALUES ('Python'), ('TensorFlow'), ('pandas'), ('SQL'), ('scikit-learn')) AS s(skill)
WHERE v.title = 'Data Scientist / ML Engineer';

INSERT INTO vacancy_skills (vacancy_id, skill_name)
SELECT v.id, s.skill FROM vacancies v
CROSS JOIN (VALUES ('Docker'), ('Kubernetes'), ('CI/CD'), ('Linux'), ('Terraform')) AS s(skill)
WHERE v.title = 'DevOps инженер';

-- Employer reviews
INSERT INTO employer_reviews (employer_id, reviewer_id, rating, comment, is_anonymous)
SELECT ep.id, (SELECT id FROM users WHERE email = 'worker1@prolink.kg'), 5,
'Отличная компания! Дружный коллектив, интересные задачи, вовремя платят зарплату. Рекомендую!', false
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'techbishkek@prolink.kg';

INSERT INTO employer_reviews (employer_id, reviewer_id, rating, comment, is_anonymous)
SELECT ep.id, (SELECT id FROM users WHERE email = 'worker2@prolink.kg'), 4,
'Хорошая компания для роста. Иногда бывают переработки, но платят за них. Менеджмент адекватный.', true
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'techbishkek@prolink.kg';

INSERT INTO employer_reviews (employer_id, reviewer_id, rating, comment, is_anonymous)
SELECT ep.id, (SELECT id FROM users WHERE email = 'worker1@prolink.kg'), 4,
'Молодой стартап с амбициями. Зарплата чуть ниже рынка, но интересные задачи и equity.', true
FROM employer_profiles ep JOIN users u ON u.id = ep.user_id WHERE u.email = 'fintechkg@prolink.kg';
