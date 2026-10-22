package com.hockeyconnect.repository;

import com.hockeyconnect.entity.Student;
import com.hockeyconnect.entity.Student.SkillLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    List<Student> findByLocation(String location);
    List<Student> findBySkillLevel(SkillLevel skillLevel);
    List<Student> findByInstitution(String institution);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.skillLevel = :level")
    long countBySkillLevel(SkillLevel level);

    @Query("SELECT s.institution, COUNT(s) FROM Student s GROUP BY s.institution")
    List<Object[]> countByInstitution();

    @Query("SELECT s.location, COUNT(s) FROM Student s GROUP BY s.location")
    List<Object[]> countByLocation();

    @Query("SELECT s.participationStatus, COUNT(s) FROM Student s GROUP BY s.participationStatus")
    List<Object[]> countByParticipationStatus();
}
