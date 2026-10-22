package com.hockeyconnect.service.impl;

import com.hockeyconnect.entity.*;
import com.hockeyconnect.exception.ResourceNotFoundException;
import com.hockeyconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceService {

    private final PerformanceRepository performanceRepository;
    private final StudentRepository studentRepository;
    private final CoachRepository coachRepository;
    private final OpportunityRepository opportunityRepository;

    @Transactional
    public Performance recordPerformance(Performance data, Long studentId, Long coachId, Long opportunityId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        data.setStudent(student);

        if (coachId != null) {
            coachRepository.findById(coachId).ifPresent(data::setCoach);
        }
        if (opportunityId != null) {
            opportunityRepository.findById(opportunityId).ifPresent(data::setOpportunity);
        }

        // Calculate overall score
        double overall = 0;
        int count = 0;
        if (data.getFitnessScore() != null) { overall += data.getFitnessScore(); count++; }
        if (data.getSkillScore() != null) { overall += data.getSkillScore(); count++; }
        if (data.getMatchPerformance() != null) { overall += data.getMatchPerformance(); count++; }
        if (count > 0) data.setOverallScore(overall / count);

        return performanceRepository.save(data);
    }

    public List<Performance> getStudentPerformance(Long studentId) {
        return performanceRepository.findByStudentIdOrderByEvaluationDateAsc(studentId);
    }

    public List<Performance> getCoachPerformanceRecords(Long coachId) {
        return performanceRepository.findByCoachId(coachId);
    }

    public Double getAverageScore(Long studentId) {
        return performanceRepository.getAverageScoreByStudentId(studentId);
    }
}
