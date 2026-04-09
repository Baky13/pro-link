package com.prolink.repository;

import com.prolink.entity.EmployerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface EmployerProfileRepository extends JpaRepository<EmployerProfile, Long> {
    Optional<EmployerProfile> findByUserId(Long userId);

    @Query("SELECT e FROM EmployerProfile e WHERE " +
           "(:search IS NULL OR LOWER(e.companyName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:industry IS NULL OR LOWER(e.industry) LIKE LOWER(CONCAT('%', :industry, '%')))")
    Page<EmployerProfile> searchEmployers(String search, String industry, Pageable pageable);
}
