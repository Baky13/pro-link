package com.prolink.service;

import com.prolink.entity.Vacancy;
import com.prolink.entity.WorkerProfile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Детерминированное ядро матчинга. Без сети, без БД — чистая логика.
 * Это надёжная основа фичи: даже если LLM недоступен, % совпадения всегда есть.
 *
 * Веса: навыки 50% / опыт 25% / зарплата 15% / заполненность профиля 10%.
 */
@Service
public class MatchingService {

    private static final double W_SKILLS = 0.50;
    private static final double W_EXPERIENCE = 0.25;
    private static final double W_SALARY = 0.15;
    private static final double W_COMPLETENESS = 0.10;

    public MatchResult compute(WorkerProfile worker, Vacancy vacancy) {
        List<String> workerSkills = normalizedSkills(
                worker.getSkills() == null ? List.of()
                        : worker.getSkills().stream().map(s -> s.getSkillName()).collect(Collectors.toList()));
        List<String> vacancySkills = normalizedSkills(
                vacancy.getSkills() == null ? List.of()
                        : vacancy.getSkills().stream().map(s -> s.getSkillName()).collect(Collectors.toList()));

        // --- Навыки ---
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        double skillScore;
        if (vacancySkills.isEmpty()) {
            skillScore = 0.6; // вакансия не указала навыки — нейтрально
        } else {
            Set<String> workerSet = Set.copyOf(workerSkills);
            for (String vs : vacancySkills) {
                if (workerSet.contains(vs)) matched.add(vs);
                else missing.add(vs);
            }
            skillScore = (double) matched.size() / vacancySkills.size();
        }
        int skillPercent = vacancySkills.isEmpty() ? 60
                : (int) Math.round(100.0 * matched.size() / vacancySkills.size());

        // --- Опыт ---
        int workerYears = worker.getExperienceYears() != null ? worker.getExperienceYears() : 0;
        Integer minExp = vacancy.getAutoRejectMinExp();
        boolean experienceOk;
        double expScore;
        if (minExp != null && minExp > 0) {
            experienceOk = workerYears >= minExp;
            expScore = experienceOk ? 1.0 : Math.max(0.0, (double) workerYears / minExp);
        } else {
            experienceOk = true;
            expScore = 0.7; // требование не задано — нейтрально
        }

        // --- Зарплата ---
        Integer expected = worker.getExpectedSalary();
        Integer salaryTo = vacancy.getSalaryTo();
        boolean salaryOk;
        double salaryScore;
        if (expected != null && expected > 0 && salaryTo != null && salaryTo > 0) {
            salaryOk = expected <= salaryTo;
            salaryScore = salaryOk ? 1.0 : Math.max(0.0, (double) salaryTo / expected);
        } else {
            salaryOk = true;
            salaryScore = 0.7; // данных нет — нейтрально
        }

        // --- Заполненность профиля ---
        int completeness = calcProfileCompleteness(worker);

        double total = W_SKILLS * skillScore
                + W_EXPERIENCE * expScore
                + W_SALARY * salaryScore
                + W_COMPLETENESS * (completeness / 100.0);
        int score = (int) Math.round(100 * total);
        score = Math.max(0, Math.min(100, score));

        return new MatchResult(score, skillPercent, experienceOk, salaryOk, completeness, matched, missing);
    }

    /** Та же логика, что в ScheduledJobService.calcProfileCompleteness (по 20% за поле). */
    public int calcProfileCompleteness(WorkerProfile worker) {
        int score = 0;
        if (worker.getTitle() != null && !worker.getTitle().isBlank()) score += 20;
        if (worker.getBio() != null && !worker.getBio().isBlank()) score += 20;
        if (worker.getResumeUrl() != null) score += 20;
        if (worker.getSkills() != null && !worker.getSkills().isEmpty()) score += 20;
        if (worker.getExperiences() != null && !worker.getExperiences().isEmpty()) score += 20;
        return score;
    }

    private List<String> normalizedSkills(List<String> raw) {
        return raw.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(s -> s.trim().toLowerCase())
                .distinct()
                .collect(Collectors.toList());
    }
}
