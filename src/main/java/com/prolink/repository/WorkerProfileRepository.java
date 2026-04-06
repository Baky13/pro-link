package com.prolink.repository;

import com.prolink.entity.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {
    Optional<WorkerProfile> findByUserId(Long userId);
}
