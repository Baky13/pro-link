package com.prolink.repository;

import com.prolink.entity.EmployerReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EmployerReviewRepository extends JpaRepository<EmployerReview, Long> {
    Page<EmployerReview> findByEmployerId(Long employerId, Pageable pageable);
    boolean existsByEmployerIdAndReviewerId(Long employerId, Long reviewerId);

    @Query("SELECT AVG(r.rating) FROM EmployerReview r WHERE r.employer.id = :employerId")
    Double getAverageRating(Long employerId);
}
