package com.hockeyconnect.service.impl;

import com.hockeyconnect.entity.*;
import com.hockeyconnect.exception.ResourceNotFoundException;
import com.hockeyconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final OpportunityRepository opportunityRepository;
    private final CoachRepository coachRepository;

    @Transactional
    public Attendance markAttendance(Long studentId, Long opportunityId, LocalDate date,
                                     Attendance.AttendanceStatus status, String remarks, Long coachId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity", opportunityId));

        // Check if already marked
        List<Attendance> existing = attendanceRepository.findByStudentIdAndOpportunityId(studentId, opportunityId);
        for (Attendance a : existing) {
            if (a.getDate().equals(date)) {
                // Update existing
                a.setStatus(status);
                a.setRemarks(remarks);
                return attendanceRepository.save(a);
            }
        }

        Attendance.AttendanceBuilder builder = Attendance.builder()
                .student(student)
                .opportunity(opportunity)
                .date(date)
                .status(status)
                .remarks(remarks);

        if (coachId != null) {
            coachRepository.findById(coachId).ifPresent(builder::markedBy);
        }

        return attendanceRepository.save(builder.build());
    }

    public List<Attendance> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getOpportunityAttendance(Long opportunityId) {
        return attendanceRepository.findByOpportunityId(opportunityId);
    }

    public double getAttendancePercentage(Long studentId) {
        long total = attendanceRepository.countTotalByStudentId(studentId);
        if (total == 0) return 0.0;
        long present = attendanceRepository.countPresentByStudentId(studentId);
        return (double) present / total * 100;
    }

    public double getOverallAttendancePercentage() {
        Double avg = attendanceRepository.getOverallAttendancePercentage();
        return avg != null ? avg : 0.0;
    }
}
