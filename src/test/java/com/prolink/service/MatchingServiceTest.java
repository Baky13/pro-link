package com.prolink.service;

import com.prolink.entity.Vacancy;
import com.prolink.entity.VacancySkill;
import com.prolink.entity.WorkerProfile;
import com.prolink.entity.WorkerSkill;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class MatchingServiceTest {

    private final MatchingService service = new MatchingService();

    private WorkerProfile worker(int years, Integer salary, boolean fullProfile, String... skills) {
        WorkerProfile w = WorkerProfile.builder()
                .id(1L)
                .experienceYears(years)
                .expectedSalary(salary)
                .build();
        if (fullProfile) {
            w.setTitle("Java Developer");
            w.setBio("Опытный разработчик");
            w.setResumeUrl("/uploads/resumes/x.pdf");
        }
        w.setSkills(java.util.Arrays.stream(skills)
                .map(s -> WorkerSkill.builder().skillName(s).build())
                .collect(Collectors.toList()));
        if (fullProfile) {
            w.setExperiences(List.of(new com.prolink.entity.WorkExperience()));
        }
        return w;
    }

    private Vacancy vacancy(Integer minExp, Integer salaryTo, String... skills) {
        Vacancy v = Vacancy.builder()
                .id(1L)
                .title("Backend Developer")
                .autoRejectMinExp(minExp)
                .salaryTo(salaryTo)
                .build();
        v.setSkills(java.util.Arrays.stream(skills)
                .map(s -> VacancySkill.builder().skillName(s).build())
                .collect(Collectors.toList()));
        return v;
    }

    @Test
    void perfectMatch_givesHighScore() {
        WorkerProfile w = worker(5, 1000, true, "Java", "Spring", "SQL");
        Vacancy v = vacancy(3, 1500, "Java", "Spring", "SQL");

        MatchResult r = service.compute(w, v);

        assertEquals(100, r.skillPercent());
        assertTrue(r.experienceOk());
        assertTrue(r.salaryOk());
        assertEquals(100, r.profileCompleteness());
        assertTrue(r.score() >= 90, "ожидался высокий score, был " + r.score());
        assertTrue(r.missingSkills().isEmpty());
    }

    @Test
    void halfSkills_givesMidScore() {
        WorkerProfile w = worker(2, 1000, true, "Java", "Spring");
        Vacancy v = vacancy(null, 1500, "Java", "Spring", "Docker", "Kubernetes");

        MatchResult r = service.compute(w, v);

        assertEquals(50, r.skillPercent());
        assertEquals(2, r.missingSkills().size());
        assertTrue(r.missingSkills().contains("docker"));
        assertTrue(r.score() > 40 && r.score() < 85, "ожидался средний score, был " + r.score());
    }

    @Test
    void notEnoughExperience_lowersScore() {
        WorkerProfile junior = worker(1, 800, true, "Java");
        Vacancy senior = vacancy(5, 2000, "Java");

        MatchResult r = service.compute(junior, senior);

        assertFalse(r.experienceOk());
        assertEquals(100, r.skillPercent()); // навык совпал, но опыт тянет вниз
    }

    @Test
    void caseInsensitiveSkillMatch() {
        WorkerProfile w = worker(3, 1000, true, "java", "  SPRING  ");
        Vacancy v = vacancy(null, 1500, "Java", "Spring");

        MatchResult r = service.compute(w, v);

        assertEquals(100, r.skillPercent(), "навыки должны сравниваться без учёта регистра и пробелов");
    }

    @Test
    void noData_doesNotCrash_andStaysInRange() {
        WorkerProfile empty = WorkerProfile.builder().id(1L).build();
        Vacancy v = Vacancy.builder().id(1L).title("X").build();

        MatchResult r = service.compute(empty, v);

        assertTrue(r.score() >= 0 && r.score() <= 100);
    }
}
