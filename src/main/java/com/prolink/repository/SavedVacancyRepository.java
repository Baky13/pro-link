package com.prolink.repository;

import com.prolink.entity.SavedVacancy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface SavedVacancyRepository extends JpaRepository<SavedVacancy, Long> {
    Page<SavedVacancy> findByUserId(Long userId, Pageable pageable);
    Optional<SavedVacancy> findByUserIdAndVacancyId(Long userId, Long vacancyId);
    boolean existsByUserIdAndVacancyId(Long userId, Long vacancyId);

    @Transactional
    void deleteByUserIdAndVacancyId(Long userId, Long vacancyId);
}
