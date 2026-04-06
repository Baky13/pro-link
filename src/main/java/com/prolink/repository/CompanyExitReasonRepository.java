package com.prolink.repository;

import com.prolink.entity.CompanyExitReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CompanyExitReasonRepository extends JpaRepository<CompanyExitReason, Long> {
    boolean existsByEmployerIdAndUserId(Long employerId, Long userId);
    List<CompanyExitReason> findByEmployerId(Long employerId);

    @Query("SELECT e.reason, COUNT(e) FROM CompanyExitReason e WHERE e.employer.id = :employerId GROUP BY e.reason")
    List<Object[]> countByReasonForEmployer(Long employerId);
}
