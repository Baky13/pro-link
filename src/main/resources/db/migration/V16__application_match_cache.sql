-- Кэш результатов ИИ-матчинга для пары вакансия <-> отклик.
-- Считается лениво при первом запросе работодателя; повторные запросы берут из БД,
-- чтобы не дёргать LLM на каждый рендер (защита лимита API на защите).
ALTER TABLE applications ADD COLUMN match_score INT;
ALTER TABLE applications ADD COLUMN match_summary TEXT;
ALTER TABLE applications ADD COLUMN match_explanation TEXT;
ALTER TABLE applications ADD COLUMN match_advice TEXT;
ALTER TABLE applications ADD COLUMN match_computed_at TIMESTAMP;
