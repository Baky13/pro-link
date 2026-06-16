package com.prolink.service;

import java.util.List;

/**
 * Результат детерминированного матчинга кандидат <-> вакансия.
 * Всегда считается оффлайн (без сети). score: 0..100.
 * breakdown-поля и списки навыков используются И для промпта LLM,
 * И для текстового fallback, если LLM недоступен.
 */
public record MatchResult(
        int score,
        int skillPercent,        // % совпавших навыков (0..100)
        boolean experienceOk,    // хватает ли опыта под требование вакансии
        boolean salaryOk,        // вписывается ли ожидание в вилку
        int profileCompleteness, // заполненность профиля 0..100
        List<String> matchedSkills,
        List<String> missingSkills
) {}
