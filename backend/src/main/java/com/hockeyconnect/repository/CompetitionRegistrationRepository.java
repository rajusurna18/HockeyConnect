package com.hockeyconnect.repository;

import com.hockeyconnect.entity.CompetitionRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CompetitionRegistrationRepository extends JpaRepository<CompetitionRegistration, Long> {
    List<CompetitionRegistration> findByStudentId(Long studentId);
    List<CompetitionRegistration> findByCompetitionId(Long competitionId);
    boolean existsByStudentIdAndCompetitionId(Long studentId, Long competitionId);
    Optional<CompetitionRegistration> findByStudentIdAndCompetitionId(Long studentId, Long competitionId);
    long countByCompetitionId(Long competitionId);
}
