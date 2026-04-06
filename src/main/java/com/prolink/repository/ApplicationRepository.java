package com.prolink.repository;

import com.prolink.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Page<Application> findByWorkerId(Long workerId, Pageable pageable);
    Page<Application> findByVacancyId(Long vacancyId, Pageable pageable);
    Optional<Application> findByVacancyIdAndWorkerId(Long vacancyId, Long workerId);
    boolean existsByVacancyIdAndWorkerId(Long vacancyId, Long workerId);

    // Заявки которые висят без ответа дольше N дней
    @Query("SELECT a FROM Application a WHERE a.status = 'PENDING' AND a.createdAt < :threshold")
    List<Application> findStaleApplications(LocalDateTime threshold);

    // Все заявки соискателя на вакансии которые были переоткрыты
    @Query("""
        SELECT a FROM Application a
        WHERE a.worker.id = :workerId
          AND a.vacancy.lastReopenedAt IS NOT NULL
          AND a.vacancy.lastReopenedAt > a.updatedAt
    """)
    List<Application> findReopenedVacanciesForWorker(Long workerId);
}
