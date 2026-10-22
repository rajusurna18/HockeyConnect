package com.hockeyconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverview {
    private long totalStudents;
    private long activeStudents;
    private long totalCoaches;
    private long totalOpportunities;
    private long totalCompetitions;
    private long totalRegistrations;
    private long totalCompetitionRegistrations;
    private double averageAttendance;
    private long beginnerStudents;
    private long intermediateStudents;
    private long advancedStudents;

    // Charts
    private List<Map<String, Object>> studentsBySkillLevel;
    private List<Map<String, Object>> studentsByInstitution;
    private List<Map<String, Object>> studentsByLocation;
    private List<Map<String, Object>> monthlyRegistrations;
    private List<Map<String, Object>> opportunitiesByType;
}
