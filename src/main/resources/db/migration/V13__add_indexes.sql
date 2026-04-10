-- V13__add_indexes.sql
-- Индексы для ускорения поиска

-- Вакансии
CREATE INDEX IF NOT EXISTS idx_vacancies_is_active ON vacancies(is_active);
CREATE INDEX IF NOT EXISTS idx_vacancies_expires_at ON vacancies(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vacancies_created_at ON vacancies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vacancies_city ON vacancies(city);

-- Уведомления
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Сообщения чата
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(room_id, created_at ASC);

-- Отклики
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Пользователи
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
