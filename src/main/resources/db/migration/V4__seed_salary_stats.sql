-- V4__seed_salary_stats.sql
-- Зарплаты в KGS (Кыргызский сом), город Бишкек

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 0, 1, 25000, 15000, 35000 FROM categories WHERE slug = 'frontend';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 1, 3, 55000, 35000, 80000 FROM categories WHERE slug = 'frontend';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 3, 100, 100000, 70000, 150000 FROM categories WHERE slug = 'frontend';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 0, 1, 30000, 20000, 40000 FROM categories WHERE slug = 'backend';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 1, 3, 65000, 40000, 90000 FROM categories WHERE slug = 'backend';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 3, 100, 120000, 80000, 180000 FROM categories WHERE slug = 'backend';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 0, 1, 20000, 12000, 30000 FROM categories WHERE slug = 'qa';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 1, 3, 45000, 30000, 65000 FROM categories WHERE slug = 'qa';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 3, 100, 80000, 55000, 120000 FROM categories WHERE slug = 'qa';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 0, 1, 18000, 10000, 25000 FROM categories WHERE slug = 'ui-ux';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 1, 3, 45000, 28000, 65000 FROM categories WHERE slug = 'ui-ux';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 3, 100, 85000, 55000, 130000 FROM categories WHERE slug = 'ui-ux';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 0, 1, 22000, 15000, 30000 FROM categories WHERE slug = 'accountant';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 1, 3, 40000, 28000, 55000 FROM categories WHERE slug = 'accountant';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 3, 100, 70000, 50000, 100000 FROM categories WHERE slug = 'accountant';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 0, 1, 25000, 18000, 35000 FROM categories WHERE slug = 'doctor';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Бишкек', 3, 100, 60000, 40000, 90000 FROM categories WHERE slug = 'doctor';

-- Ош
INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Ош', 0, 1, 18000, 10000, 25000 FROM categories WHERE slug = 'frontend';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Ош', 1, 3, 38000, 25000, 55000 FROM categories WHERE slug = 'frontend';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Ош', 0, 1, 20000, 12000, 28000 FROM categories WHERE slug = 'backend';

INSERT INTO salary_stats (category_id, city, experience_min, experience_max, salary_avg, salary_min, salary_max)
SELECT id, 'Ош', 1, 3, 45000, 28000, 65000 FROM categories WHERE slug = 'backend';
