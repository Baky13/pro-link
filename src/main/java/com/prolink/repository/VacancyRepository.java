package com.prolink.repository;

import com.prolink.entity.Vacancy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

public interface VacancyRepository extends JpaRepository<Vacancy, Long>, JpaSpecificationExecutor<Vacancy> {

    Page<Vacancy> findByIsActiveTrueAndIsHotTrue(Pageable pageable);
    Page<Vacancy> findByIsActiveTrueAndIsUrgentTrue(Pageable pageable);
    Page<Vacancy> findByEmployerIdAndIsActiveTrue(Long employerId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE Vacancy v SET v.viewsCount = v.viewsCount + 1 WHERE v.id = :id")
    void incrementViews(Long id);

    @Modifying
    @Transactional
    @Query("UPDATE Vacancy v SET v.applicantsCount = v.applicantsCount + 1 WHERE v.id = :id")
    void incrementApplicants(Long id);

    // Вакансии где работодатель не ответил за N дней
    @Query("""
        SELECT DISTINCT v FROM Vacancy v
        JOIN Application a ON a.vacancy.id = v.id
        WHERE a.status = 'PENDING'
          AND a.createdAt < :threshold
          AND v.isActive = TRUE
    """)
    List<Vacancy> findVacanciesWithOverdueResponses(LocalDateTime threshold);

    @Modifying
    @Transactional
    @Query("UPDATE Vacancy v SET v.isActive = false WHERE v.expiresAt IS NOT NULL AND v.expiresAt < :now AND v.isActive = true")
    int deactivateExpired(LocalDateTime now);
}
