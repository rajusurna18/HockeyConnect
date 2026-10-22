package com.hockeyconnect.repository;

import com.hockeyconnect.entity.Performance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    List<Performance> findByStudentIdOrderByEvaluationDateAsc(Long studentId);
    List<Performance> findByCoachId(Long coachId);

    @Query("SELECT AVG(p.overallScore) FROM Performance p WHERE p.student.id = :studentId")
    Double getAverageScoreByStudentId(@Param("studentId") Long studentId);
}
