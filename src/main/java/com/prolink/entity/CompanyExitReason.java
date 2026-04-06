package com.prolink.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_exit_reasons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CompanyExitReason {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private EmployerProfile employer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private Reason reason;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Reason { LOW_SALARY, BAD_MANAGEMENT, NO_GROWTH, TOXIC_CULTURE, RELOCATION, OTHER }
}
