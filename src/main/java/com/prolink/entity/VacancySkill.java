package com.prolink.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vacancy_skills")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VacancySkill {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vacancy_id", nullable = false)
    private Vacancy vacancy;

    @Column(nullable = false)
    private String skillName;
}
