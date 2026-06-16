-- В живой БД у работодателей хеш пароля не совпадал с password123 — вход был невозможен.
-- Ставим всем EMPLOYER тот же валидный bcrypt-хеш password123, что у воркеров в V8.
UPDATE users
SET password = '$2a$10$TQT1yHmlPjAOmDpkFjqQZufqPnZ2l9Mm8AIpELWpL2alYsF169P7m'
WHERE role = 'EMPLOYER';
