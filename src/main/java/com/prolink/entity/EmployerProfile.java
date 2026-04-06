package com.prolink.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "employer_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployerProfile {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String companyName;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String website;
    private String logoUrl;
    private String industry;
    private String companySize;
    private Integer foundedYear;

    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Builder.Default
    private Integer reviewsCount = 0;

    @Builder.Default
    private Integer complaintsCount = 0;

    @Builder.Default
    private Boolean isBlacklisted = false;

    @Builder.Default
    private Boolean isVerified = false;

    @OneToMany(mappedBy = "employer", cascade = CascadeType.ALL)
    private List<Vacancy> vacancies;

    @OneToMany(mappedBy = "employer", cascade = CascadeType.ALL)
    private List<EmployerReview> reviews;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
