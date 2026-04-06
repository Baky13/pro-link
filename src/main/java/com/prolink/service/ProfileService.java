package com.prolink.service;

import com.prolink.dto.*;
import com.prolink.entity.*;
import com.prolink.exception.BadRequestException;
import com.prolink.exception.ResourceNotFoundException;
import com.prolink.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final WorkerProfileRepository workerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final EmployerReviewRepository reviewRepository;
    private final UserRepository userRepository;

    // ---- Worker ----

    public WorkerDto.Response getWorkerById(Long id) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));
        return toWorkerResponse(profile);
    }

    public WorkerDto.Response getWorkerProfile(Long userId) {
        WorkerProfile profile = workerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
        return toWorkerResponse(profile);
    }

    @Transactional
    public WorkerDto.Response updateWorkerProfile(Long userId, WorkerDto.Request request) {
        WorkerProfile profile = workerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));

        profile.setTitle(request.getTitle());
        profile.setBio(request.getBio());
        profile.setGithubUrl(request.getGithubUrl());
        profile.setPortfolioUrl(request.getPortfolioUrl());
        profile.setLinkedinUrl(request.getLinkedinUrl());
        profile.setExpectedSalary(request.getExpectedSalary());
        profile.setIsOpenToWork(request.getIsOpenToWork());
        if (request.getJobSearchStatus() != null) profile.setJobSearchStatus(request.getJobSearchStatus());
        profile.setAvailableFrom(request.getAvailableFrom());
        profile.setExperienceYears(request.getExperienceYears());

        if (request.getSkills() != null) {
            profile.getSkills().clear();
            List<WorkerSkill> skills = request.getSkills().stream()
                    .map(s -> WorkerSkill.builder().worker(profile).skillName(s).build())
                    .collect(Collectors.toList());
            profile.getSkills().addAll(skills);
        }

        return toWorkerResponse(workerProfileRepository.save(profile));
    }

    public String uploadFile(Long userId, MultipartFile file, String type) throws IOException {
        String uploadDir = "uploads/" + type;
        Files.createDirectories(Paths.get(uploadDir));
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir, filename);
        Files.write(path, file.getBytes());
        String url = "/uploads/" + type + "/" + filename;

        User user = userRepository.findById(userId).orElseThrow();
        if ("avatars".equals(type)) {
            user.setAvatarUrl(url);
            userRepository.save(user);
        } else if ("resumes".equals(type)) {
            WorkerProfile profile = workerProfileRepository.findByUserId(userId).orElseThrow();
            profile.setResumeUrl(url);
            workerProfileRepository.save(profile);
        } else if ("logos".equals(type)) {
            EmployerProfile profile = employerProfileRepository.findByUserId(userId).orElseThrow();
            profile.setLogoUrl(url);
            employerProfileRepository.save(profile);
        }
        return url;
    }

    // ---- Employer ----

    public EmployerDto.Response getEmployerProfile(Long userId) {
        EmployerProfile profile = employerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found"));
        return toEmployerResponse(profile);
    }

    public EmployerDto.Response getEmployerById(Long id) {
        EmployerProfile profile = employerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));
        return toEmployerResponse(profile);
    }

    @Transactional
    public EmployerDto.Response updateEmployerProfile(Long userId, EmployerDto.Request request) {
        EmployerProfile profile = employerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found"));
        profile.setCompanyName(request.getCompanyName());
        profile.setDescription(request.getDescription());
        profile.setWebsite(request.getWebsite());
        profile.setIndustry(request.getIndustry());
        profile.setCompanySize(request.getCompanySize());
        profile.setFoundedYear(request.getFoundedYear());
        return toEmployerResponse(employerProfileRepository.save(profile));
    }

    @Transactional
    public EmployerDto.ReviewResponse addReview(Long employerId, EmployerDto.ReviewRequest request, Long reviewerId) {
        if (reviewRepository.existsByEmployerIdAndReviewerId(employerId, reviewerId)) {
            throw new BadRequestException("You already reviewed this employer");
        }
        EmployerProfile employer = employerProfileRepository.findById(employerId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found"));
        User reviewer = userRepository.findById(reviewerId).orElseThrow();

        EmployerReview review = EmployerReview.builder()
                .employer(employer)
                .reviewer(reviewer)
                .rating(request.getRating())
                .comment(request.getComment())
                .isAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : true)
                .build();
        reviewRepository.save(review);

        Double avg = reviewRepository.getAverageRating(employerId);
        employer.setRating(avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        employer.setReviewsCount(employer.getReviewsCount() + 1);
        employerProfileRepository.save(employer);

        return toReviewResponse(review);
    }

    public Page<EmployerDto.ReviewResponse> getReviews(Long employerId, Pageable pageable) {
        return reviewRepository.findByEmployerId(employerId, pageable).map(this::toReviewResponse);
    }

    // ---- Mappers ----

    private WorkerDto.Response toWorkerResponse(WorkerProfile p) {
        WorkerDto.Response r = new WorkerDto.Response();
        r.setId(p.getId());
        r.setUserId(p.getUser().getId());
        r.setTitle(p.getTitle());
        r.setBio(p.getBio());
        r.setResumeUrl(p.getResumeUrl());
        r.setGithubUrl(p.getGithubUrl());
        r.setPortfolioUrl(p.getPortfolioUrl());
        r.setLinkedinUrl(p.getLinkedinUrl());
        r.setExpectedSalary(p.getExpectedSalary());
        r.setIsOpenToWork(p.getIsOpenToWork());
        r.setJobSearchStatus(p.getJobSearchStatus());
        r.setAvailableFrom(p.getAvailableFrom());
        r.setExperienceYears(p.getExperienceYears());
        r.setUser(UserDto.from(p.getUser()));
        if (p.getSkills() != null)
            r.setSkills(p.getSkills().stream().map(WorkerSkill::getSkillName).collect(Collectors.toList()));
        if (p.getExperiences() != null)
            r.setExperiences(p.getExperiences().stream().map(this::toExpDto).collect(Collectors.toList()));
        return r;
    }

    private WorkerDto.ExperienceDto toExpDto(WorkExperience e) {
        WorkerDto.ExperienceDto dto = new WorkerDto.ExperienceDto();
        dto.setId(e.getId());
        dto.setCompanyName(e.getCompanyName());
        dto.setPosition(e.getPosition());
        dto.setDescription(e.getDescription());
        dto.setStartDate(e.getStartDate());
        dto.setEndDate(e.getEndDate());
        dto.setIsCurrent(e.getIsCurrent());
        return dto;
    }

    private EmployerDto.Response toEmployerResponse(EmployerProfile p) {
        EmployerDto.Response r = new EmployerDto.Response();
        r.setId(p.getId());
        r.setUserId(p.getUser().getId());
        r.setCompanyName(p.getCompanyName());
        r.setDescription(p.getDescription());
        r.setWebsite(p.getWebsite());
        r.setLogoUrl(p.getLogoUrl());
        r.setIndustry(p.getIndustry());
        r.setCompanySize(p.getCompanySize());
        r.setFoundedYear(p.getFoundedYear());
        r.setRating(p.getRating());
        r.setReviewsCount(p.getReviewsCount());
        r.setComplaintsCount(p.getComplaintsCount());
        r.setIsBlacklisted(p.getIsBlacklisted());
        r.setIsVerified(p.getIsVerified());
        r.setUser(UserDto.from(p.getUser()));
        return r;
    }

    private EmployerDto.ReviewResponse toReviewResponse(EmployerReview review) {
        EmployerDto.ReviewResponse r = new EmployerDto.ReviewResponse();
        r.setId(review.getId());
        r.setRating(review.getRating());
        r.setComment(review.getComment());
        r.setIsAnonymous(review.getIsAnonymous());
        r.setReviewerName(review.getIsAnonymous() ? "Анонимный пользователь"
                : review.getReviewer().getFirstName() + " " + review.getReviewer().getLastName());
        r.setCreatedAt(review.getCreatedAt().toString());
        return r;
    }
}
