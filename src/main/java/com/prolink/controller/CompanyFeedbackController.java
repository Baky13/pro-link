package com.prolink.controller;

import com.prolink.dto.CompanyFeedbackDto;
import com.prolink.entity.User;
import com.prolink.service.CompanyFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CompanyFeedbackController {

    private final CompanyFeedbackService companyFeedbackService;

    // Жалоба на компанию
    @PostMapping("/employers/{id}/complaints")
    public ResponseEntity<CompanyFeedbackDto.ComplaintResponse> addComplaint(
            @PathVariable Long id,
            @RequestBody CompanyFeedbackDto.ComplaintRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(companyFeedbackService.addComplaint(id, request, user.getId()));
    }

    // Причина увольнения
    @PostMapping("/employers/{id}/exit-reasons")
    public ResponseEntity<Void> addExitReason(
            @PathVariable Long id,
            @RequestBody CompanyFeedbackDto.ExitReasonRequest request,
            @AuthenticationPrincipal User user) {
        companyFeedbackService.addExitReason(id, request, user.getId());
        return ResponseEntity.ok().build();
    }

    // Статистика причин увольнения
    @GetMapping("/employers/{id}/exit-reasons")
    public ResponseEntity<CompanyFeedbackDto.ExitReasonStats> getExitReasonStats(@PathVariable Long id) {
        return ResponseEntity.ok(companyFeedbackService.getExitReasonStats(id));
    }

    // Зарплатный калькулятор
    @PostMapping("/salary/calculate")
    public ResponseEntity<CompanyFeedbackDto.SalaryCalcResponse> calculateSalary(
            @RequestBody CompanyFeedbackDto.SalaryCalcRequest request) {
        return ResponseEntity.ok(companyFeedbackService.calculateSalary(request));
    }
}
