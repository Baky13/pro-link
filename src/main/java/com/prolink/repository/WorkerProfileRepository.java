package com.prolink.repository;

import com.prolink.entity.WorkerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {
    Optional<WorkerProfile> findByUserId(Long userId);

    @Query("""
        SELECT DISTINCT w FROM WorkerProfile w
        LEFT JOIN w.skills s
        WHERE w.isOpenToWork = true
        AND (:search IS NULL OR :search = ''
            OR LOWER(w.title) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(w.bio) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.skillName) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:city IS NULL OR :city = ''
            OR LOWER(w.user.city) LIKE LOWER(CONCAT('%', :city, '%')))
        AND (:minExp IS NULL OR w.experienceYears >= :minExp)
        AND (:maxSalary IS NULL OR w.expectedSalary <= :maxSalary)
    """)
    Page<WorkerProfile> searchWorkers(
        String search, String city,
        Integer minExp, Integer maxSalary,
        Pageable pageable
    );
}
