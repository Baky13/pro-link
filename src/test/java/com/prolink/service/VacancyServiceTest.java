package com.prolink.service;

import com.prolink.dto.VacancyDto;
import com.prolink.entity.*;
import com.prolink.exception.BadRequestException;
import com.prolink.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VacancyServiceTest {

    @Mock VacancyRepository vacancyRepository;
    @Mock EmployerProfileRepository employerProfileRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock SavedVacancyRepository savedVacancyRepository;
    @Mock UserRepository userRepository;

    @InjectMocks VacancyService vacancyService;

    @Test
    void create_success() {
        User user = User.builder().id(1L).email("e@test.com").role(User.Role.EMPLOYER).firstName("E").lastName("E").build();
        EmployerProfile employer = EmployerProfile.builder().id(1L).user(user).companyName("Test Co").build();
        Category category = Category.builder().id(1L).name("IT").slug("it").build();

        when(employerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(employer));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(vacancyRepository.save(any())).thenAnswer(i -> {
            Vacancy v = i.getArgument(0);
            v.setId(1L);
            return v;
        });

        VacancyDto.Request request = new VacancyDto.Request();
        request.setTitle("Java Developer");
        request.setDescription("We need Java dev");
        request.setCategoryId(1L);
        request.setSalaryFrom(50000);
        request.setSalaryTo(100000);
        request.setCurrency("KGS");

        VacancyDto.Response response = vacancyService.create(request, 1L);

        assertNotNull(response);
        assertEquals("Java Developer", response.getTitle());
    }

    @Test
    void delete_notOwner_throwsException() {
        User owner = User.builder().id(1L).email("e@test.com").role(User.Role.EMPLOYER).firstName("E").lastName("E").build();
        EmployerProfile employer = EmployerProfile.builder().id(1L).user(owner).companyName("Test Co").build();
        Vacancy vacancy = Vacancy.builder().id(1L).title("Dev").employer(employer).build();

        when(vacancyRepository.findById(1L)).thenReturn(Optional.of(vacancy));

        assertThrows(BadRequestException.class, () -> vacancyService.delete(1L, 999L));
        verify(vacancyRepository, never()).delete(any(Vacancy.class));
    }

    @Test
    void toggleSave_savesVacancy() {
        User user = User.builder().id(1L).email("w@test.com").role(User.Role.WORKER).firstName("W").lastName("W").build();
        EmployerProfile employer = EmployerProfile.builder().id(1L)
                .user(User.builder().id(2L).email("e@test.com").role(User.Role.EMPLOYER).firstName("E").lastName("E").build())
                .companyName("Test Co").build();
        Vacancy vacancy = Vacancy.builder().id(1L).title("Dev").employer(employer).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(vacancyRepository.findById(1L)).thenReturn(Optional.of(vacancy));
        when(savedVacancyRepository.existsByUserIdAndVacancyId(1L, 1L)).thenReturn(false);

        vacancyService.toggleSave(1L, 1L);

        verify(savedVacancyRepository).save(any());
    }
}
