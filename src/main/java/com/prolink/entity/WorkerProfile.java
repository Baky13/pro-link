package com.prolink.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "worker_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkerProfile {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String resumeUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String linkedinUrl;
    private Integer expectedSalary;

    @Builder.Default
    private Boolean isOpenToWork = true;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private JobSearchStatus jobSearchStatus = JobSearchStatus.OPEN_TO_OFFERS;

    private LocalDate availableFrom;

    @Builder.Default
    private Integer experienceYears = 0;

    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkerSkill> skills;

    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkExperience> experiences;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum JobSearchStatus { ACTIVELY_LOOKING, OPEN_TO_OFFERS, NOT_LOOKING }
}
