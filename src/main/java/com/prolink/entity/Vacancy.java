package com.prolink.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vacancies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vacancy {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private EmployerProfile employer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    private Integer salaryFrom;
    private Integer salaryTo;

    @Builder.Default
    private String currency = "KZT";

    private String city;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EmploymentType employmentType = EmploymentType.FULL_TIME;

    @Builder.Default
    private Boolean isHot = false;

    @Builder.Default
    private Boolean isUrgent = false;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Integer viewsCount = 0;

    @Builder.Default
    private Integer applicantsCount = 0;

    @Builder.Default
    private Integer responseDeadlineDays = 7;

    @Builder.Default
    private Boolean autoRejectEnabled = false;

    private Integer autoRejectMinExp;
    private Integer autoRejectMinSalary;
    private Integer autoRejectMinAge;

    @Column(columnDefinition = "TEXT")
    private String autoRejectCustomCriteria;

    private LocalDateTime lastReopenedAt;

    @OneToMany(mappedBy = "vacancy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VacancySkill> skills;

    @OneToMany(mappedBy = "vacancy", cascade = CascadeType.ALL)
    private List<Application> applications;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime expiresAt;

    public enum EmploymentType { FULL_TIME, PART_TIME, REMOTE, FREELANCE, INTERNSHIP }
}
