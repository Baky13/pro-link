package com.prolink.repository;

import com.prolink.entity.SalaryStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface SalaryStatRepository extends JpaRepository<SalaryStat, Long> {

    @Query("""
        SELECT s FROM SalaryStat s
        WHERE s.category.id = :categoryId
          AND (:city IS NULL OR LOWER(s.city) = LOWER(:city))
          AND s.experienceMin <= :experience
          AND s.experienceMax >= :experience
        ORDER BY s.updatedAt DESC
        LIMIT 1
    """)
    Optional<SalaryStat> findBest(Long categoryId, String city, Integer experience);
}
