-- V2__seed_categories.sql

INSERT INTO categories (name, slug, icon, parent_id) VALUES
('IT и технологии', 'it', '💻', NULL),
('Медицина', 'medicine', '🏥', NULL),
('Финансы', 'finance', '💰', NULL),
('Образование', 'education', '📚', NULL),
('Маркетинг', 'marketing', '📣', NULL),
('Дизайн', 'design', '🎨', NULL),
('Строительство', 'construction', '🏗️', NULL),
('Подработка', 'parttime', '⚡', NULL),
('Транспорт', 'transport', '🚗', NULL),
('Юриспруденция', 'legal', '⚖️', NULL);

-- IT subcategories
INSERT INTO categories (name, slug, icon, parent_id)
SELECT name, slug, icon, (SELECT id FROM categories WHERE slug = 'it')
FROM (VALUES
    ('Frontend разработка', 'frontend', '🖥️'),
    ('Backend разработка', 'backend', '⚙️'),
    ('Fullstack разработка', 'fullstack', '🔧'),
    ('DevOps / SRE', 'devops', '🚀'),
    ('Mobile разработка', 'mobile', '📱'),
    ('Data Science / ML', 'data-science', '🤖'),
    ('QA / Тестирование', 'qa', '🧪'),
    ('UI/UX дизайн', 'ui-ux', '✏️'),
    ('Кибербезопасность', 'security', '🔒'),
    ('Системный администратор', 'sysadmin', '🖧')
) AS t(name, slug, icon);

-- Medicine subcategories
INSERT INTO categories (name, slug, icon, parent_id)
SELECT name, slug, icon, (SELECT id FROM categories WHERE slug = 'medicine')
FROM (VALUES
    ('Врач', 'doctor', '👨‍⚕️'),
    ('Медсестра / медбрат', 'nurse', '💉'),
    ('Фармацевт', 'pharmacist', '💊'),
    ('Стоматолог', 'dentist', '🦷')
) AS t(name, slug, icon);

-- Finance subcategories
INSERT INTO categories (name, slug, icon, parent_id)
SELECT name, slug, icon, (SELECT id FROM categories WHERE slug = 'finance')
FROM (VALUES
    ('Бухгалтер', 'accountant', '📊'),
    ('Финансовый аналитик', 'financial-analyst', '📈'),
    ('Банковское дело', 'banking', '🏦')
) AS t(name, slug, icon);
