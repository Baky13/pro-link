package com.prolink.repository;

import com.prolink.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    @Query("SELECT r FROM ChatRoom r WHERE r.worker.id = :userId OR r.employer.id = :userId")
    List<ChatRoom> findByUserId(Long userId);
    Optional<ChatRoom> findByApplicationId(Long applicationId);

    @Query("SELECT r FROM ChatRoom r WHERE r.worker.id = :workerId AND r.employer.id = :employerId")
    Optional<ChatRoom> findByWorkerIdAndEmployerId(Long workerId, Long employerId);

    @Query("SELECT r FROM ChatRoom r WHERE (r.worker.id = :userId OR r.employer.id = :userId) AND r.isArchived = false")
    List<ChatRoom> findActiveByUserId(Long userId);

    @Query("SELECT r FROM ChatRoom r WHERE (r.worker.id = :userId OR r.employer.id = :userId) AND r.isArchived = true")
    List<ChatRoom> findArchivedByUserId(Long userId);
}
