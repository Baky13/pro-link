package com.prolink.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_complaints")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CompanyComplaint {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private EmployerProfile employer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Enumerated(EnumType.STRING)
    private Reason reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Reason { FAKE_VACANCY, NO_PAYMENT, FRAUD, HARASSMENT, OTHER }
}
