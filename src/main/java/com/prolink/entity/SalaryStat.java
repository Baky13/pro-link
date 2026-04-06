package com.prolink.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "salary_stats")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryStat {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    private String city;

    @Builder.Default
    private Integer experienceMin = 0;

    @Builder.Default
    private Integer experienceMax = 100;

    private Integer salaryAvg;
    private Integer salaryMin;
    private Integer salaryMax;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
