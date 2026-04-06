package com.prolink.repository;

import com.prolink.entity.CompanyComplaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompanyComplaintRepository extends JpaRepository<CompanyComplaint, Long> {
    boolean existsByEmployerIdAndReporterId(Long employerId, Long reporterId);
    int countByEmployerId(Long employerId);
    List<CompanyComplaint> findByEmployerId(Long employerId);
}
