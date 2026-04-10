package com.prolink.service;

import com.prolink.dto.CategoryDto;
import com.prolink.dto.EmployerDto;
import com.prolink.dto.VacancyDto;
import com.prolink.entity.*;
import com.prolink.exception.BadRequestException;
import com.prolink.exception.ResourceNotFoundException;
import com.prolink.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyService {

    private final VacancyRepository vacancyRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final CategoryRepository categoryRepository;
    private final SavedVacancyRepository savedVacancyRepository;
    private final UserRepository userRepository;

    public Page<VacancyDto.Response> getVacancies(VacancyDto.Filter filter, Pageable pageable) {
        Specification<Vacancy> spec = buildSpec(filter);
        return vacancyRepository.findAll(spec, pageable).map(this::toResponse);
    }

    public Page<VacancyDto.Response> getHotVacancies(Pageable pageable) {
        return vacancyRepository.findByIsActiveTrueAndIsHotTrue(pageable).map(this::toResponse);
    }

    public Page<VacancyDto.Response> getUrgentVacancies(Pageable pageable) {
        return vacancyRepository.findByIsActiveTrueAndIsUrgentTrue(pageable).map(this::toResponse);
    }

    public VacancyDto.Response getById(Long id) {
        Vacancy vacancy = findById(id);
        try { vacancyRepository.incrementViews(id); } catch (Exception ignored) {}
        return toResponse(vacancy);
    }

    @Transactional
    public VacancyDto.Response create(VacancyDto.Request request, Long userId) {
        EmployerProfile employer = employerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Employer profile not found"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Vacancy vacancy = Vacancy.builder()
                .employer(employer)
                .category(category)
                .title(request.getTitle())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .salaryFrom(request.getSalaryFrom())
                .salaryTo(request.getSalaryTo())
                .currency(request.getCurrency() != null ? request.getCurrency() : "KGS")
                .city(request.getCity())
                .address(request.getAddress())
                .employmentType(request.getEmploymentType() != null ? request.getEmploymentType() : Vacancy.EmploymentType.FULL_TIME)
                .isHot(request.getIsHot() != null && request.getIsHot())
                .isUrgent(request.getIsUrgent() != null && request.getIsUrgent())
                .responseDeadlineDays(request.getResponseDeadlineDays() != null ? request.getResponseDeadlineDays() : 7)
                .autoRejectEnabled(request.getAutoRejectEnabled() != null && request.getAutoRejectEnabled())
                .autoRejectMinExp(request.getAutoRejectMinExp())
                .expiresAt(request.getExpiresAt())
                .build();

        vacancyRepository.save(vacancy);

        if (request.getSkills() != null) {
            List<VacancySkill> skills = request.getSkills().stream()
                    .map(s -> VacancySkill.builder().vacancy(vacancy).skillName(s).build())
                    .collect(Collectors.toList());
            vacancy.setSkills(skills);
            vacancyRepository.save(vacancy);
        }

        return toResponse(vacancy);
    }

    @Transactional
    public VacancyDto.Response update(Long id, VacancyDto.Request request, Long userId) {
        Vacancy vacancy = findById(id);
        if (!vacancy.getEmployer().getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }
        vacancy.setTitle(request.getTitle());
        vacancy.setDescription(request.getDescription());
        vacancy.setRequirements(request.getRequirements());
        vacancy.setSalaryFrom(request.getSalaryFrom());
        vacancy.setSalaryTo(request.getSalaryTo());
        vacancy.setCity(request.getCity());
        vacancy.setAddress(request.getAddress());
        if (request.getEmploymentType() != null) vacancy.setEmploymentType(request.getEmploymentType());
        if (request.getIsHot() != null) vacancy.setIsHot(request.getIsHot());
        if (request.getIsUrgent() != null) vacancy.setIsUrgent(request.getIsUrgent());
        vacancy.setAutoRejectEnabled(request.getAutoRejectEnabled() != null && request.getAutoRejectEnabled());
        vacancy.setAutoRejectMinExp(request.getAutoRejectMinExp());
        return toResponse(vacancyRepository.save(vacancy));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Vacancy vacancy = findById(id);
        if (!vacancy.getEmployer().getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }
        vacancyRepository.delete(vacancy);
    }

    public void toggleSave(Long vacancyId, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Vacancy vacancy = findById(vacancyId);
        if (savedVacancyRepository.existsByUserIdAndVacancyId(userId, vacancyId)) {
            savedVacancyRepository.deleteByUserIdAndVacancyId(userId, vacancyId);
        } else {
            savedVacancyRepository.save(SavedVacancy.builder().user(user).vacancy(vacancy).build());
        }
    }

    public Page<VacancyDto.Response> getSavedVacancies(Long userId, Pageable pageable) {
        return savedVacancyRepository.findByUserId(userId, pageable)
                .map(sv -> toResponse(sv.getVacancy()));
    }

    public Page<VacancyDto.Response> getMyVacancies(Long userId, Pageable pageable) {
        EmployerProfile employer = employerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Employer profile not found"));
        return vacancyRepository.findByEmployerIdAndIsActiveTrue(employer.getId(), pageable).map(this::toResponse);
    }

    private Specification<Vacancy> buildSpec(VacancyDto.Filter filter) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            predicates.add(cb.isTrue(root.get("isActive")));

            if (filter != null) {
                if (filter.getCategoryId() != null)
                    predicates.add(cb.equal(root.get("category").get("id"), filter.getCategoryId()));
                if (filter.getCity() != null && !filter.getCity().isBlank())
                    predicates.add(cb.like(cb.lower(root.get("city")), "%" + filter.getCity().toLowerCase() + "%"));
                if (filter.getSalaryFrom() != null)
                    predicates.add(cb.greaterThanOrEqualTo(root.get("salaryFrom"), filter.getSalaryFrom()));
                if (filter.getSalaryTo() != null)
                    predicates.add(cb.lessThanOrEqualTo(root.get("salaryTo"), filter.getSalaryTo()));
                if (filter.getEmploymentType() != null)
                    predicates.add(cb.equal(root.get("employmentType"), filter.getEmploymentType()));
                if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                    String like = "%" + filter.getSearch().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("title")), like),
                            cb.like(cb.lower(root.get("description")), like)
                    ));
                }
                if (filter.getSkill() != null && !filter.getSkill().isBlank()) {
                    String skillLike = "%" + filter.getSkill().toLowerCase() + "%";
                    var skillJoin = root.join("skills", jakarta.persistence.criteria.JoinType.INNER);
                    predicates.add(cb.like(cb.lower(skillJoin.get("skillName")), skillLike));
                    query.distinct(true);
                }
                if (Boolean.TRUE.equals(filter.getIsHot()))
                    predicates.add(cb.isTrue(root.get("isHot")));
                if (Boolean.TRUE.equals(filter.getIsUrgent()))
                    predicates.add(cb.isTrue(root.get("isUrgent")));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Vacancy findById(Long id) {
        return vacancyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy not found"));
    }

    public VacancyDto.Response toResponse(Vacancy v) {
        VacancyDto.Response r = new VacancyDto.Response();
        r.setId(v.getId());
        r.setTitle(v.getTitle());
        r.setDescription(v.getDescription());
        r.setRequirements(v.getRequirements());
        r.setSalaryFrom(v.getSalaryFrom());
        r.setSalaryTo(v.getSalaryTo());
        r.setCurrency(v.getCurrency());
        r.setCity(v.getCity());
        r.setAddress(v.getAddress());
        if (v.getLatitude() != null) r.setLatitude(v.getLatitude().doubleValue());
        if (v.getLongitude() != null) r.setLongitude(v.getLongitude().doubleValue());
        r.setEmploymentType(v.getEmploymentType());
        r.setIsHot(v.getIsHot());
        r.setIsUrgent(v.getIsUrgent());
        r.setIsActive(v.getIsActive());
        r.setViewsCount(v.getViewsCount());
        r.setApplicantsCount(v.getApplicantsCount());
        r.setResponseDeadlineDays(v.getResponseDeadlineDays());
        r.setAutoRejectMinExp(v.getAutoRejectMinExp());
        r.setCreatedAt(v.getCreatedAt());
        r.setExpiresAt(v.getExpiresAt());

        if (v.getSkills() != null)
            r.setSkills(v.getSkills().stream().map(VacancySkill::getSkillName).collect(Collectors.toList()));

        if (v.getCategory() != null) {
            CategoryDto cat = new CategoryDto();
            cat.setId(v.getCategory().getId());
            cat.setName(v.getCategory().getName());
            cat.setSlug(v.getCategory().getSlug());
            cat.setIcon(v.getCategory().getIcon());
            r.setCategory(cat);
        }

        if (v.getEmployer() != null) {
            EmployerDto.Summary emp = new EmployerDto.Summary();
            emp.setId(v.getEmployer().getId());
            emp.setCompanyName(v.getEmployer().getCompanyName());
            emp.setLogoUrl(v.getEmployer().getLogoUrl());
            emp.setRating(v.getEmployer().getRating());
            emp.setIsVerified(v.getEmployer().getIsVerified());
            r.setEmployer(emp);
        }
        return r;
    }
}
