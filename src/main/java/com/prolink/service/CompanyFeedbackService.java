package com.prolink.service;

import com.prolink.dto.CompanyFeedbackDto;
import com.prolink.entity.*;
import com.prolink.exception.BadRequestException;
import com.prolink.exception.ResourceNotFoundException;
import com.prolink.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CompanyFeedbackService {

    private final CompanyComplaintRepository complaintRepository;
    private final CompanyExitReasonRepository exitReasonRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final int BLACKLIST_THRESHOLD = 10;

    // ---- Жалобы (чёрный список) ----

    @Transactional
    public CompanyFeedbackDto.ComplaintResponse addComplaint(Long employerId, CompanyFeedbackDto.ComplaintRequest request, Long reporterId) {
        if (complaintRepository.existsByEmployerIdAndReporterId(employerId, reporterId)) {
            throw new BadRequestException("Вы уже оставляли жалобу на эту компанию");
        }
        EmployerProfile employer = employerProfileRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Компания не найдена"));
        User reporter = userRepository.findById(reporterId).orElseThrow();

        CompanyComplaint complaint = CompanyComplaint.builder()
                .employer(employer)
                .reporter(reporter)
                .reason(request.getReason())
                .description(request.getDescription())
                .build();
        complaintRepository.save(complaint);

        employer.setComplaintsCount(employer.getComplaintsCount() + 1);

        if (employer.getComplaintsCount() >= BLACKLIST_THRESHOLD && !employer.getIsBlacklisted()) {
            employer.setIsBlacklisted(true);
            notificationService.notify(
                    employer.getUser(),
                    Notification.Type.COMPANY_BLACKLISTED,
                    "Ваша компания попала в чёрный список",
                    "На вашу компанию поступило " + BLACKLIST_THRESHOLD + "+ жалоб. Профиль помечен как ненадёжный.",
                    employer.getId()
            );
        }
        employerProfileRepository.save(employer);

        CompanyFeedbackDto.ComplaintResponse response = new CompanyFeedbackDto.ComplaintResponse();
        response.setId(complaint.getId());
        response.setReason(complaint.getReason());
        response.setDescription(complaint.getDescription());
        response.setCreatedAt(complaint.getCreatedAt());
        return response;
    }

    // ---- Причины увольнения ----

    @Transactional
    public void addExitReason(Long employerId, CompanyFeedbackDto.ExitReasonRequest request, Long userId) {
        if (exitReasonRepository.existsByEmployerIdAndUserId(employerId, userId)) {
            throw new BadRequestException("Вы уже оставляли причину ухода для этой компании");
        }
        EmployerProfile employer = employerProfileRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Компания не найдена"));
        User user = userRepository.findById(userId).orElseThrow();

        CompanyExitReason exitReason = CompanyExitReason.builder()
                .employer(employer)
                .user(user)
                .reason(request.getReason())
                .comment(request.getComment())
                .build();
        exitReasonRepository.save(exitReason);
    }

    public CompanyFeedbackDto.ExitReasonStats getExitReasonStats(Long employerId) {
        List<Object[]> raw = exitReasonRepository.countByReasonForEmployer(employerId);
        Map<String, Long> counts = new LinkedHashMap<>();
        long total = 0;
        for (Object[] row : raw) {
            String reason = row[0].toString();
            Long count = (Long) row[1];
            counts.put(reason, count);
            total += count;
        }
        CompanyFeedbackDto.ExitReasonStats stats = new CompanyFeedbackDto.ExitReasonStats();
        stats.setEmployerId(employerId);
        stats.setReasonCounts(counts);
        stats.setTotalExits((int) total);
        return stats;
    }
}
