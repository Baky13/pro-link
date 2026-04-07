package com.prolink.controller;

import com.prolink.dto.EmployerDto;
import com.prolink.dto.WorkerDto;
import com.prolink.entity.User;
import com.prolink.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/worker/profile")
    public WorkerDto.Response getWorkerProfile(@AuthenticationPrincipal User user) {
        return profileService.getWorkerProfile(user.getId());
    }

    @GetMapping("/workers/{id}")
    public WorkerDto.Response getWorkerById(@PathVariable Long id) {
        return profileService.getWorkerById(id);
    }

    @GetMapping("/workers")
    public org.springframework.data.domain.Page<WorkerDto.Response> searchWorkers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer minExp,
            @RequestParam(required = false) Integer maxSalary,
            @org.springframework.data.web.PageableDefault(size = 20) org.springframework.data.domain.Pageable pageable) {
        return profileService.searchWorkers(search, city, minExp, maxSalary, pageable);
    }

    @PutMapping("/worker/profile")
    public WorkerDto.Response updateWorkerProfile(@AuthenticationPrincipal User user,
                                                   @RequestBody WorkerDto.Request request) {
        return profileService.updateWorkerProfile(user.getId(), request);
    }

    @GetMapping("/employer/profile")
    public EmployerDto.Response getEmployerProfile(@AuthenticationPrincipal User user) {
        return profileService.getEmployerProfile(user.getId());
    }

    @GetMapping("/employers/{id}")
    public EmployerDto.Response getEmployerById(@PathVariable Long id) {
        return profileService.getEmployerById(id);
    }

    @PutMapping("/employer/profile")
    public EmployerDto.Response updateEmployerProfile(@AuthenticationPrincipal User user,
                                                       @RequestBody EmployerDto.Request request) {
        return profileService.updateEmployerProfile(user.getId(), request);
    }

    @PostMapping("/employers/{id}/reviews")
    public ResponseEntity<EmployerDto.ReviewResponse> addReview(@PathVariable Long id,
                                                                  @RequestBody EmployerDto.ReviewRequest request,
                                                                  @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.addReview(id, request, user.getId()));
    }

    @GetMapping("/employers/{id}/reviews")
    public Page<EmployerDto.ReviewResponse> getReviews(@PathVariable Long id,
                                                        @PageableDefault(size = 10) Pageable pageable) {
        return profileService.getReviews(id, pageable);
    }

    @PostMapping("/upload/{type}")
    public ResponseEntity<String> uploadFile(@PathVariable String type,
                                              @RequestParam("file") MultipartFile file,
                                              @AuthenticationPrincipal User user) throws Exception {
        return ResponseEntity.ok(profileService.uploadFile(user.getId(), file, type));
    }
}
