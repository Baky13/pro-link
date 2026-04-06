package com.prolink.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private Type type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Builder.Default
    private Boolean isRead = false;

    private Long referenceId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Type {
        APPLICATION_STATUS, NEW_MESSAGE, NEW_VACANCY, REVIEW,
        STALE_APPLICATION, VACANCY_REOPENED, COMPANY_BLACKLISTED, RESPONSE_DEADLINE_WARNING
    }
}
