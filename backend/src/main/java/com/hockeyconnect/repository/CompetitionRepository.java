package com.hockeyconnect.repository;

import com.hockeyconnect.entity.Competition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {
    List<Competition> findByStatus(Competition.Status status);
    List<Competition> findBySkillLevel(Competition.SkillLevel skillLevel);
}
