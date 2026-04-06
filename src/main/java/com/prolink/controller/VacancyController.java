package com.prolink.controller;

import com.prolink.dto.VacancyDto;
import com.prolink.entity.User;
import com.prolink.service.VacancyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vacancies")
@RequiredArgsConstructor
public class VacancyController {

    private final VacancyService vacancyService;

    @GetMapping
    public Page<VacancyDto.Response> getAll(VacancyDto.Filter filter,
                                             @PageableDefault(size = 20) Pageable pageable) {
        return vacancyService.getVacancies(filter, pageable);
    }

    @GetMapping("/hot")
    public Page<VacancyDto.Response> getHot(@PageableDefault(size = 10) Pageable pageable) {
        return vacancyService.getHotVacancies(pageable);
    }

    @GetMapping("/urgent")
    public Page<VacancyDto.Response> getUrgent(@PageableDefault(size = 10) Pageable pageable) {
        return vacancyService.getUrgentVacancies(pageable);
    }

    @GetMapping("/my")
    public Page<VacancyDto.Response> getMy(@AuthenticationPrincipal User user,
                                            @PageableDefault(size = 50) Pageable pageable) {
        return vacancyService.getMyVacancies(user.getId(), pageable);
    }

    @GetMapping("/saved")
    public Page<VacancyDto.Response> getSaved(@AuthenticationPrincipal User user,
                                               @PageableDefault(size = 20) Pageable pageable) {
        return vacancyService.getSavedVacancies(user.getId(), pageable);
    }

    @GetMapping("/{id}")
    public VacancyDto.Response getById(@PathVariable Long id) {
        return vacancyService.getById(id);
    }

    @PostMapping
    public ResponseEntity<VacancyDto.Response> create(@Valid @RequestBody VacancyDto.Request request,
                                                       @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(vacancyService.create(request, user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VacancyDto.Response> update(@PathVariable Long id,
                                                       @Valid @RequestBody VacancyDto.Request request,
                                                       @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(vacancyService.update(id, request, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        vacancyService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<Void> toggleSave(@PathVariable Long id, @AuthenticationPrincipal User user) {
        vacancyService.toggleSave(id, user.getId());
        return ResponseEntity.ok().build();
    }
}
