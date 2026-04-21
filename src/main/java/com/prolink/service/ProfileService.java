package com.prolink.service;

import com.prolink.dto.*;
import com.prolink.entity.*;
import com.prolink.exception.BadRequestException;
import com.prolink.exception.ResourceNotFoundException;
import com.prolink.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
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

    public org.springframework.data.domain.Page<WorkerDto.Response> searchWorkers(
            String search, String city, Integer minExp, Integer maxSalary,
            org.springframework.data.domain.Pageable pageable) {
        return workerProfileRepository.searchWorkers(search, city, minExp, maxSalary, pageable)
                .map(this::toWorkerResponse);
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
        // Нормализация URL: добавляем https:// если протокола нет
        profile.setGithubUrl(normalizeUrl(request.getGithubUrl()));
        profile.setPortfolioUrl(normalizeUrl(request.getPortfolioUrl()));
        profile.setLinkedinUrl(normalizeUrl(request.getLinkedinUrl()));
        profile.setExpectedSalary(request.getExpectedSalary());
        profile.setIsOpenToWork(request.getIsOpenToWork());
        if (request.getJobSearchStatus() != null) profile.setJobSearchStatus(request.getJobSearchStatus());
        profile.setAvailableFrom(request.getAvailableFrom());
        if (request.getExperienceYears() != null) {
            profile.setExperienceYears(request.getExperienceYears());
        }

        if (request.getSkills() != null) {
            profile.getSkills().clear();
            List<WorkerSkill> skills = request.getSkills().stream()
                    .map(s -> WorkerSkill.builder().worker(profile).skillName(s).build())
                    .collect(Collectors.toList());
            profile.getSkills().addAll(skills);
        }

        return toWorkerResponse(workerProfileRepository.save(profile));
    }

    @Transactional
    public void deleteUpload(Long userId, String type) {
        if (!List.of("avatars", "resumes", "logos").contains(type)) {
            throw new BadRequestException("Недопустимый тип");
        }
        String urlToDelete = null;
        if ("avatars".equals(type)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            urlToDelete = user.getAvatarUrl();
            user.setAvatarUrl(null);
            userRepository.save(user);
        } else if ("resumes".equals(type)) {
            WorkerProfile profile = workerProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
            urlToDelete = profile.getResumeUrl();
            profile.setResumeUrl(null);
            workerProfileRepository.save(profile);
        } else {
            EmployerProfile profile = employerProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found"));
            urlToDelete = profile.getLogoUrl();
            profile.setLogoUrl(null);
            employerProfileRepository.save(profile);
        }
        // Удаляем физический файл, если возможно
        if (urlToDelete != null && urlToDelete.startsWith("/uploads/")) {
            try {
                Path file = Paths.get(urlToDelete.substring(1)).normalize();
                Path uploadsRoot = Paths.get("uploads").toAbsolutePath().normalize();
                if (file.toAbsolutePath().normalize().startsWith(uploadsRoot)) {
                    Files.deleteIfExists(file);
                }
            } catch (IOException e) {
                log.warn("Failed to delete file {}: {}", urlToDelete, e.getMessage());
            }
        }
    }

    public String uploadFile(Long userId, MultipartFile file, String type) throws IOException {
        // Валидация типа файла
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Файл пустой");
        }

        // Валидация типа загрузки
        if (!List.of("avatars", "resumes", "logos").contains(type)) {
            throw new BadRequestException("Недопустимый тип загрузки");
        }

        // Валидация расширения файла
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) throw new BadRequestException("Неверное имя файла");
        String ext = originalFilename.contains(".") ?
                originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase() : "";

        if ("avatars".equals(type) || "logos".equals(type)) {
            if (!List.of(".jpg", ".jpeg", ".png", ".gif", ".webp").contains(ext)) {
                throw new BadRequestException("Допустимы только изображения: jpg, jpeg, png, gif, webp");
            }
        } else if ("resumes".equals(type)) {
            if (!List.of(".pdf", ".doc", ".docx").contains(ext)) {
                throw new BadRequestException("Допустимы только: pdf, doc, docx");
            }
        }

        // Безопасное имя файла — только UUID + расширение
        String filename = UUID.randomUUID() + ext;
        String uploadDir = "uploads/" + type;
        Files.createDirectories(Paths.get(uploadDir));

        // Защита от path traversal
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path filePath = uploadPath.resolve(filename).normalize();
        if (!filePath.startsWith(uploadPath)) {
            throw new BadRequestException("Недопустимый путь файла");
        }

        Files.write(filePath, file.getBytes());
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

    public Page<EmployerDto.Response> searchEmployers(String search, String industry, Pageable pageable) {
        return employerProfileRepository.searchEmployers(search, industry, pageable)
                .map(this::toEmployerResponse);
    }

    @Transactional
    public EmployerDto.Response updateEmployerProfile(Long userId, EmployerDto.Request request) {
        EmployerProfile profile = employerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile not found"));
        profile.setCompanyName(request.getCompanyName());
        profile.setDescription(request.getDescription());
        profile.setWebsite(normalizeUrl(request.getWebsite()));
        if (request.getFoundedYear() != null) {
            int currentYear = java.time.Year.now().getValue();
            if (request.getFoundedYear() > currentYear) {
                throw new BadRequestException("Год основания не может быть в будущем");
            }
        }
        if (request.getIndustry() != null && !request.getIndustry().isBlank()
                && !ALLOWED_INDUSTRIES.contains(request.getIndustry().trim())) {
            throw new BadRequestException("Выберите отрасль из списка");
        }
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

    private static final java.util.regex.Pattern DOMAIN_RE = java.util.regex.Pattern.compile(
            "^(https?://)?([\\p{L}\\d](?:[\\p{L}\\d-]{0,61}[\\p{L}\\d])?\\.)+[\\p{L}]{2,}(:\\d{1,5})?(/\\S*)?$",
            java.util.regex.Pattern.CASE_INSENSITIVE
    );

    private String normalizeUrl(String url) {
        if (url == null || url.isBlank()) return null;
        String trimmed = url.trim();
        String lower = trimmed.toLowerCase();
        if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("file:")) {
            throw new BadRequestException("Недопустимая ссылка");
        }
        if (!DOMAIN_RE.matcher(trimmed).matches()) {
            throw new BadRequestException("Некорректная ссылка. Пример: example.com или https://example.com");
        }
        if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
            trimmed = "https://" + trimmed;
        }
        return trimmed;
    }

    private static final java.util.Set<String> ALLOWED_INDUSTRIES = java.util.Set.of(
            "IT и разработка",
            "Финансы и банки",
            "Образование",
            "Медицина и фармацевтика",
            "Торговля и e-commerce",
            "Строительство и недвижимость",
            "Производство",
            "Транспорт и логистика",
            "Маркетинг и реклама",
            "HR и рекрутинг",
            "Сфера услуг",
            "Искусство и медиа",
            "Госслужба",
            "Наука и исследования",
            "Сельское хозяйство",
            "Ресторанный бизнес",
            "Туризм",
            "Другое"
    );

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
        r.setExperienceYears(p.getExperienceYears() != null ? p.getExperienceYears() : 0);
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
