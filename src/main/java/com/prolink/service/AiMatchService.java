package com.prolink.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prolink.entity.Vacancy;
import com.prolink.entity.WorkerProfile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Оркестратор ИИ-матчинга: детерминированное ядро (MatchingService) + текст от LLM (GeminiClient).
 * Любой сбой LLM → детерминированный fallback-текст из MatchResult. Демо не падает никогда.
 * In-memory кэш по паре worker:vacancy (TTL 30 мин) — чтобы не дёргать API на каждый рендер.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiMatchService {

    private final MatchingService matchingService;
    private final GeminiClient gemini;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private static final long TTL_MS = 30 * 60 * 1000;

    private static final String SYSTEM =
            "Ты — ассистент по подбору работы платформы ProLink. " +
            "Объясняй соответствие кандидата и вакансии простым русским языком, кратко и по делу. " +
            "Не выдумывай факты — используй только переданные данные. " +
            "Отвечай ТОЛЬКО валидным JSON без markdown и без пояснений вокруг.";

    public record WorkerMatch(int score, int skillPercent, String explanation, String advice, List<String> missingSkills) {}
    public record ApplicantMatch(int score, String summary, List<String> missingSkills) {}

    /** Для соискателя: % + объяснение + совет. Кэшируется in-memory. */
    public WorkerMatch forWorker(WorkerProfile worker, Vacancy vacancy) {
        String key = "w" + worker.getId() + ":v" + vacancy.getId();
        CacheEntry c = cache.get(key);
        if (c != null && !c.expired()) return (WorkerMatch) c.value;

        MatchResult m = matchingService.compute(worker, vacancy);
        String explanation = fallbackExplanation(m);
        String advice = fallbackAdvice(m);

        Optional<String> llm = gemini.generateJson(SYSTEM, workerPrompt(worker, vacancy, m));
        if (llm.isPresent()) {
            try {
                JsonNode j = objectMapper.readTree(llm.get());
                explanation = textOr(j, "explanation", explanation);
                advice = textOr(j, "advice", advice);
            } catch (Exception e) {
                log.warn("Gemini вернул не-JSON, fallback: {}", e.getMessage());
            }
        }
        WorkerMatch wm = new WorkerMatch(m.score(), m.skillPercent(), explanation, advice, m.missingSkills());
        cache.put(key, new CacheEntry(wm));
        return wm;
    }

    /** Для работодателя: % + резюме кандидата. Кэш делает вызывающий (поля в Application). */
    public ApplicantMatch forApplicant(WorkerProfile worker, Vacancy vacancy) {
        MatchResult m = matchingService.compute(worker, vacancy);
        String summary = fallbackSummary(m);

        Optional<String> llm = gemini.generateJson(SYSTEM, applicantPrompt(worker, vacancy, m));
        if (llm.isPresent()) {
            try {
                JsonNode j = objectMapper.readTree(llm.get());
                summary = textOr(j, "summary", summary);
            } catch (Exception e) {
                log.warn("Gemini вернул не-JSON, fallback: {}", e.getMessage());
            }
        }
        return new ApplicantMatch(m.score(), summary, m.missingSkills());
    }

    /** Чистый score без LLM (для сортировки/рекомендаций — быстро и без сети). */
    public int score(WorkerProfile worker, Vacancy vacancy) {
        return matchingService.compute(worker, vacancy).score();
    }

    // ---- Промпты ----

    private String workerPrompt(WorkerProfile w, Vacancy v, MatchResult m) {
        return "Данные для оценки соответствия СОИСКАТЕЛЯ вакансии.\n"
                + "Вакансия: \"" + safe(v.getTitle()) + "\".\n"
                + "Требуемые навыки: " + skillsOf(v) + ".\n"
                + "Навыки кандидата: " + workerSkillsOf(w) + ".\n"
                + "Совпавшие навыки: " + join(m.matchedSkills()) + ".\n"
                + "Недостающие навыки: " + join(m.missingSkills()) + ".\n"
                + "Опыт кандидата: " + (w.getExperienceYears() == null ? 0 : w.getExperienceYears()) + " лет; "
                + "требование вакансии: " + (v.getAutoRejectMinExp() == null ? "не задано" : v.getAutoRejectMinExp() + " лет") + ".\n"
                + "Заполненность профиля: " + m.profileCompleteness() + "%.\n"
                + "Итоговый балл совпадения: " + m.score() + " из 100.\n\n"
                + "Верни JSON: {\"explanation\": \"1-2 предложения, почему вакансия подходит или не очень\", "
                + "\"advice\": \"1-2 предложения: что добавить в профиль, чтобы повысить шансы\"}.";
    }

    private String applicantPrompt(WorkerProfile w, Vacancy v, MatchResult m) {
        return "Данные для оценки КАНДИДАТА с точки зрения работодателя.\n"
                + "Вакансия: \"" + safe(v.getTitle()) + "\".\n"
                + "Требуемые навыки: " + skillsOf(v) + ".\n"
                + "Навыки кандидата: " + workerSkillsOf(w) + ".\n"
                + "Совпавшие: " + join(m.matchedSkills()) + "; недостающие: " + join(m.missingSkills()) + ".\n"
                + "Опыт: " + (w.getExperienceYears() == null ? 0 : w.getExperienceYears()) + " лет.\n"
                + "Балл совпадения: " + m.score() + " из 100.\n\n"
                + "Верни JSON: {\"summary\": \"1-2 предложения для работодателя: сильные стороны и пробелы кандидата\"}.";
    }

    // ---- Fallback-тексты (детерминированы, без сети) ----

    private String fallbackExplanation(MatchResult m) {
        StringBuilder sb = new StringBuilder();
        sb.append("Совпадение по навыкам ").append(m.skillPercent()).append("%. ");
        sb.append(m.experienceOk() ? "Опыта достаточно. " : "Опыта может не хватать. ");
        sb.append(m.salaryOk() ? "Зарплатные ожидания в рамках вакансии." : "Ожидания по зарплате выше вилки вакансии.");
        return sb.toString();
    }

    private String fallbackAdvice(MatchResult m) {
        if (m.missingSkills() != null && !m.missingSkills().isEmpty()) {
            return "Добавьте в профиль навыки: " + join(m.missingSkills()) + " — это повысит совпадение.";
        }
        if (m.profileCompleteness() < 100) {
            return "Заполните профиль до конца (резюме, опыт, био) — работодатели чаще выбирают полные профили.";
        }
        return "Профиль хорошо подходит — добавьте сопроводительное письмо к отклику.";
    }

    private String fallbackSummary(MatchResult m) {
        StringBuilder sb = new StringBuilder("Совпадение ").append(m.score()).append("%. ");
        if (m.missingSkills() != null && !m.missingSkills().isEmpty()) {
            sb.append("Не хватает навыков: ").append(join(m.missingSkills())).append(". ");
        } else {
            sb.append("Все ключевые навыки присутствуют. ");
        }
        sb.append(m.experienceOk() ? "Опыт соответствует." : "Опыт ниже требуемого.");
        return sb.toString();
    }

    // ---- helpers ----

    private String textOr(JsonNode node, String field, String fallback) {
        JsonNode n = node.path(field);
        return (n.isMissingNode() || n.asText().isBlank()) ? fallback : n.asText().trim();
    }

    private String skillsOf(Vacancy v) {
        if (v.getSkills() == null || v.getSkills().isEmpty()) return "не указаны";
        return v.getSkills().stream().map(s -> s.getSkillName()).collect(java.util.stream.Collectors.joining(", "));
    }

    private String workerSkillsOf(WorkerProfile w) {
        if (w.getSkills() == null || w.getSkills().isEmpty()) return "не указаны";
        return w.getSkills().stream().map(s -> s.getSkillName()).collect(java.util.stream.Collectors.joining(", "));
    }

    private String join(List<String> list) {
        return (list == null || list.isEmpty()) ? "нет" : String.join(", ", list);
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private static class CacheEntry {
        final Object value;
        final long ts;
        CacheEntry(Object value) { this.value = value; this.ts = System.currentTimeMillis(); }
        boolean expired() { return System.currentTimeMillis() - ts > TTL_MS; }
    }
}
