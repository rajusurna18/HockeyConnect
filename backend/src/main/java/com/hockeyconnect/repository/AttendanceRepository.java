package com.hockeyconnect.repository;

import com.hockeyconnect.entity.Attendance;
import com.hockeyconnect.entity.Attendance.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByOpportunityId(Long opportunityId);
    List<Attendance> findByStudentIdAndOpportunityId(Long studentId, Long opportunityId);

    long countByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'PRESENT'")
    long countPresentByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId")
    long countTotalByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT AVG(CASE WHEN a.status = 'PRESENT' THEN 1.0 ELSE 0.0 END) * 100 FROM Attendance a")
    Double getOverallAttendancePercentage();
}
