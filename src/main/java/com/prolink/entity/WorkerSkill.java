package com.prolink.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "worker_skills")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkerSkill {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private WorkerProfile worker;

    @Column(nullable = false)
    private String skillName;
}
