package com.prolink.service;

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
class ProfileServiceTest {

    @Mock WorkerProfileRepository workerProfileRepository;
    @Mock EmployerProfileRepository employerProfileRepository;
    @Mock EmployerReviewRepository reviewRepository;
    @Mock UserRepository userRepository;

    @InjectMocks ProfileService profileService;

    @Test
    void getWorkerById_notFound_throwsException() {
        when(workerProfileRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> profileService.getWorkerById(999L));
    }

    @Test
    void updateEmployerProfile_invalidWebsite_throwsException() {
        User user = User.builder().id(1L).email("e@test.com").role(User.Role.EMPLOYER).firstName("E").lastName("E").build();
        EmployerProfile profile = EmployerProfile.builder().id(1L).user(user).companyName("Test Co").build();

        when(employerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));

        com.prolink.dto.EmployerDto.Request request = new com.prolink.dto.EmployerDto.Request();
        request.setCompanyName("Test Co");
        request.setWebsite("not-a-valid-url");

        assertThrows(BadRequestException.class, () -> profileService.updateEmployerProfile(1L, request));
    }

    @Test
    void updateEmployerProfile_validWebsite_success() {
        User user = User.builder().id(1L).email("e@test.com").role(User.Role.EMPLOYER).firstName("E").lastName("E").build();
        EmployerProfile profile = EmployerProfile.builder().id(1L).user(user).companyName("Test Co").build();

        when(employerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(employerProfileRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        com.prolink.dto.EmployerDto.Request request = new com.prolink.dto.EmployerDto.Request();
        request.setCompanyName("Test Co");
        request.setWebsite("https://test.com");

        assertDoesNotThrow(() -> profileService.updateEmployerProfile(1L, request));
    }
}
