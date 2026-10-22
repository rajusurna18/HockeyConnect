package com.hockeyconnect.repository;

import com.hockeyconnect.entity.Coach;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CoachRepository extends JpaRepository<Coach, Long> {
    Optional<Coach> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
