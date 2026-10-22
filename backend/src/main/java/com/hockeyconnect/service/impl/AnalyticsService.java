package com.hockeyconnect.service.impl;

import com.hockeyconnect.dto.response.AnalyticsOverview;
import com.hockeyconnect.entity.Student;
import com.hockeyconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final StudentRepository studentRepository;
    private final CoachRepository coachRepository;
    private final OpportunityRepository opportunityRepository;
    private final CompetitionRepository competitionRepository;
    private final TrainingRegistrationRepository trainingRegRepo;
    private final CompetitionRegistrationRepository competitionRegRepo;
    private final AttendanceRepository attendanceRepository;

    public AnalyticsOverview getOverview() {
        long totalStudents = studentRepository.count();
        long activeStudents = studentRepository.countBySkillLevel(Student.SkillLevel.BEGINNER)
                + studentRepository.countBySkillLevel(Student.SkillLevel.INTERMEDIATE)
                + studentRepository.countBySkillLevel(Student.SkillLevel.ADVANCED);

        long beginners = studentRepository.countBySkillLevel(Student.SkillLevel.BEGINNER);
        long intermediate = studentRepository.countBySkillLevel(Student.SkillLevel.INTERMEDIATE);
        long advanced = studentRepository.countBySkillLevel(Student.SkillLevel.ADVANCED);

        long totalCoaches = coachRepository.count();
        long totalOpportunities = opportunityRepository.count();
        long totalCompetitions = competitionRepository.count();
        long totalRegistrations = trainingRegRepo.count();
        long totalCompRegs = competitionRegRepo.count();

        Double avgAttendanceRaw = attendanceRepository.getOverallAttendancePercentage();
        double avgAttendance = avgAttendanceRaw != null ? avgAttendanceRaw : 0.0;

        // Skill level chart
        List<Map<String, Object>> skillData = new ArrayList<>();
        skillData.add(Map.of("name", "Beginner", "value", beginners));
        skillData.add(Map.of("name", "Intermediate", "value", intermediate));
        skillData.add(Map.of("name", "Advanced", "value", advanced));

        // Institution chart
        List<Map<String, Object>> institutionData = new ArrayList<>();
        List<Object[]> instRaw = studentRepository.countByInstitution();
        for (Object[] row : instRaw) {
            institutionData.add(Map.of("name", row[0] != null ? row[0] : "Unknown", "value", row[1]));
        }

        // Location chart
        List<Map<String, Object>> locationData = new ArrayList<>();
        List<Object[]> locRaw = studentRepository.countByLocation();
        for (Object[] row : locRaw) {
            locationData.add(Map.of("name", row[0] != null ? row[0] : "Unknown", "value", row[1]));
        }

        // Monthly registrations
        int currentYear = LocalDate.now().getYear();
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        Map<Integer, Long> monthMap = new HashMap<>();
        List<Object[]> monthlyRaw = trainingRegRepo.countMonthlyRegistrations(currentYear);
        for (Object[] row : monthlyRaw) {
            monthMap.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }
        for (int i = 1; i <= 12; i++) {
            monthlyData.add(Map.of("month", months[i-1], "registrations", monthMap.getOrDefault(i, 0L)));
        }

        // Opportunities by type
        List<Map<String, Object>> typeData = new ArrayList<>();
        List<Object[]> typeRaw = opportunityRepository.countByType();
        for (Object[] row : typeRaw) {
            typeData.add(Map.of("name", row[0].toString(), "value", row[1]));
        }

        return AnalyticsOverview.builder()
                .totalStudents(totalStudents)
                .activeStudents(activeStudents)
                .totalCoaches(totalCoaches)
                .totalOpportunities(totalOpportunities)
                .totalCompetitions(totalCompetitions)
                .totalRegistrations(totalRegistrations)
                .totalCompetitionRegistrations(totalCompRegs)
                .averageAttendance(Math.round(avgAttendance * 10.0) / 10.0)
                .beginnerStudents(beginners)
                .intermediateStudents(intermediate)
                .advancedStudents(advanced)
                .studentsBySkillLevel(skillData)
                .studentsByInstitution(institutionData)
                .studentsByLocation(locationData)
                .monthlyRegistrations(monthlyData)
                .opportunitiesByType(typeData)
                .build();
    }
}
