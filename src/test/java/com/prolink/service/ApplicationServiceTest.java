package com.prolink.service;

import com.prolink.dto.ApplicationDto;
import com.prolink.entity.*;
import com.prolink.exception.BadRequestException;
import com.prolink.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock ApplicationRepository applicationRepository;
    @Mock VacancyRepository vacancyRepository;
    @Mock WorkerProfileRepository workerProfileRepository;
    @Mock NotificationService notificationService;
    @Mock VacancyService vacancyService;

    @InjectMocks ApplicationService applicationService;

    @Test
    void apply_alreadyApplied_throwsException() {
        User user = User.builder().id(1L).email("w@test.com").role(User.Role.WORKER).firstName("W").lastName("W").build();
        WorkerProfile worker = WorkerProfile.builder().id(1L).user(user).experienceYears(0).build();
        EmployerProfile employer = EmployerProfile.builder().id(1L)
                .user(User.builder().id(2L).email("e@test.com").role(User.Role.EMPLOYER).firstName("E").lastName("E").build())
                .companyName("Test Co").build();
        Vacancy vacancy = Vacancy.builder().id(1L).title("Dev").employer(employer).isActive(true).build();

        when(workerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(worker));
        when(vacancyRepository.findById(1L)).thenReturn(Optional.of(vacancy));
        when(applicationRepository.existsByVacancyIdAndWorkerId(1L, 1L)).thenReturn(true);

        ApplicationDto.Request request = new ApplicationDto.Request();
        request.setVacancyId(1L);

        assertThrows(BadRequestException.class, () -> applicationService.apply(request, 1L));
    }

    @Test
    void apply_autoReject_notEnoughExp() {
        User user = User.builder().id(1L).email("w@test.com").role(User.Role.WORKER).firstName("W").lastName("W").build();
        WorkerProfile worker = WorkerProfile.builder().id(1L).user(user).experienceYears(1).build();
        EmployerProfile employer = EmployerProfile.builder().id(1L)
                .user(User.builder().id(2L).email("e@test.com").role(User.Role.EMPLOYER).firstName("E").lastName("E").build())
                .companyName("Test Co").build();
        Vacancy vacancy = Vacancy.builder().id(1L).title("Dev").employer(employer)
                .autoRejectEnabled(true).autoRejectMinExp(3).isActive(true).build();

        when(workerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(worker));
        when(vacancyRepository.findById(1L)).thenReturn(Optional.of(vacancy));
        when(applicationRepository.existsByVacancyIdAndWorkerId(any(), any())).thenReturn(false);
        when(applicationRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(vacancyService.toResponse(any())).thenReturn(null);

        ApplicationDto.Request request = new ApplicationDto.Request();
        request.setVacancyId(1L);

        ApplicationDto.Response response = applicationService.apply(request, 1L);

        assertEquals(Application.Status.REJECTED, response.getStatus());
        verify(notificationService).notify(eq(user), eq(Notification.Type.APPLICATION_STATUS), any(), contains("опыту"), any());
    }

    @Test
    void cancelApplication_invited_throwsException() {
        User user = User.builder().id(1L).email("w@test.com").role(User.Role.WORKER).firstName("W").lastName("W").build();
        WorkerProfile worker = WorkerProfile.builder().id(1L).user(user).build();
        EmployerProfile employer = EmployerProfile.builder().id(1L)
                .user(User.builder().id(2L).email("e@test.com").role(User.Role.EMPLOYER).firstName("E").lastName("E").build())
                .companyName("Test Co").build();
        Vacancy vacancy = Vacancy.builder().id(1L).title("Dev").employer(employer).build();
        Application app = Application.builder().id(1L).worker(worker).vacancy(vacancy)
                .status(Application.Status.INVITED).build();

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(app));

        assertThrows(BadRequestException.class, () -> applicationService.cancelApplication(1L, 1L));
    }
}
