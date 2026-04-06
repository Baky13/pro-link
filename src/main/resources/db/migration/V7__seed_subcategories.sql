-- V7__seed_subcategories.sql

-- Образование
INSERT INTO categories (name, slug, icon, parent_id)
SELECT name, slug, icon, (SELECT id FROM categories WHERE slug = 'education')
FROM (VALUES
    ('Учитель / Преподаватель', 'teacher', '👨‍🏫'),
    ('Репетитор', 'tutor', '📖'),
    ('Воспитатель', 'kindergarten', '🧒'),
    ('Тренер', 'coach', '🏋️'),
    ('Методист', 'methodist', '📋')
) AS t(name, slug, icon);

-- Маркетинг
INSERT INTO categories (name, slug, icon, parent_id)
SELECT name, slug, icon, (SELECT id FROM categories WHERE slug = 'marketing')
FROM (VALUES
    ('SMM специалист', 'smm', '📱'),
    ('Контент-менеджер', 'content', '✍️'),
    ('SEO специалист', 'seo', '🔍'),
    ('Таргетолог', 'targeting', '🎯'),
    ('Бренд-менеджер', 'brand', '💡'),
    ('PR менеджер', 'pr', '📢')
) AS t(name, slug, icon);

-- Дизайн
INSERT INTO categories (name, slug, icon, parent_id)
SELECT name, slug, icon, (SELECT id FROM categories WHERE slug = 'design')
FROM (VALUES
    ('Графический дизайнер', 'graphic-design', '🎨'),
    ('UI/UX дизайнер', 'ux-design', '🖌️'),
    ('Веб-дизайнер', 'web-design', '🌐'),
    ('Моушн дизайнер', 'motion', '🎬'),
    ('3D дизайнер', '3d-design', '🧊'),
    ('Иллюстратор', 'illustrator', '✏️')
) AS t(name, slug, icon);

-- Строительство
INSERT INTO categories (name, slug, icon, parent_id)
SELECT name, slug, icon, (SELECT id FROM categories WHERE slug = 'construction')
FROM (VALUES
    ('Прораб', 'foreman', '👷'),
    ('Инженер-строитель', 'civil-engineer', '🏗️'),
    ('Архитектор', 'architect', '📐'),
    ('Электрик', 'electrician', '⚡'),
    ('Сантехник', 'plumber', '🔧'),
    ('Сварщик', 'welder', '🔥'),
    ('Отделочник', 'finisher', '🪣')
) AS t(name, slug, icon);

-- Подработка
INSERT INTO categories (name, slug, icon, parent_id)
SELECT name, slug, icon, (SELECT id FROM categories WHERE slug = 'parttime')
FROM (VALUES
    ('Курьер', 'courier', '🛵'),
    ('Промоутер', 'promoter', '📣'),
    ('Грузчик', 'loader', '📦'),
    ('Уборщик', 'cleaner', '🧹'),
    ('Официант', 'waiter', '🍽️'),
    ('Кассир', 'cashier', '💳'),
    ('Охранник', 'security-guard', '🛡️')
) AS t(name, slug, icon);

-- Транспорт
INSERT INTO categories (name, slug, icon, parent_id)
SELECT name, slug, icon, (SELECT id FROM categories WHERE slug = 'transport')
FROM (VALUES
    ('Водитель', 'driver', '🚗'),
    ('Водитель такси', 'taxi-driver', '🚕'),
    ('Дальнобойщик', 'truck-driver', '🚛'),
    ('Логист', 'logist', '📦'),
    ('Экспедитор', 'forwarder', '🗺️'),
    ('Диспетчер', 'dispatcher', '📞')
) AS t(name, slug, icon);

-- Юриспруденция
INSERT INTO categories (name, slug, icon, parent_id)
SELECT name, slug, icon, (SELECT id FROM categories WHERE slug = 'legal')
FROM (VALUES
    ('Юрист', 'lawyer', '⚖️'),
    ('Адвокат', 'advocate', '👨‍⚖️'),
    ('Нотариус', 'notary', '📜'),
    ('Юрисконсульт', 'legal-counsel', '📋'),
    ('Помощник юриста', 'legal-assistant', '📁')
) AS t(name, slug, icon);
