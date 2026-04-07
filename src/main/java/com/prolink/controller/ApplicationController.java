package com.prolink.controller;

import com.prolink.dto.ApplicationDto;
import com.prolink.entity.Application;
import com.prolink.entity.User;
import com.prolink.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<ApplicationDto.Response> apply(
            @Valid @RequestBody ApplicationDto.Request request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.apply(request, user.getId()));
    }

    @GetMapping("/my")
    public Page<ApplicationDto.Response> getMyApplications(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20) Pageable pageable) {
        return applicationService.getMyApplications(user.getId(), pageable);
    }

    @GetMapping("/vacancy/{vacancyId}")
    public Page<ApplicationDto.Response> getVacancyApplications(
            @PathVariable Long vacancyId,
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20) Pageable pageable) {
        return applicationService.getVacancyApplications(vacancyId, user.getId(), pageable);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationDto.Response> updateStatus(
            @PathVariable Long id,
            @RequestBody ApplicationDto.StatusUpdate request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.updateStatus(id, request.getStatus(), user.getId()));
    }

    @GetMapping("/check")
    public ResponseEntity<java.util.Map<String, Object>> check(
            @RequestParam Long vacancyId,
            @AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.WORKER) {
            return ResponseEntity.ok(java.util.Map.of("applied", false));
        }
        return ResponseEntity.ok(applicationService.checkApplication(vacancyId, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id, @AuthenticationPrincipal User user) {
        applicationService.cancelApplication(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
