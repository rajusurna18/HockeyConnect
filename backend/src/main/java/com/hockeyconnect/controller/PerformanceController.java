package com.hockeyconnect.controller;

import com.hockeyconnect.dto.response.ApiResponse;
import com.hockeyconnect.entity.Performance;
import com.hockeyconnect.service.impl.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<Performance>> recordPerformance(@RequestBody Map<String, Object> body) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Long coachId = body.get("coachId") != null ? Long.valueOf(body.get("coachId").toString()) : null;
        Long opportunityId = body.get("opportunityId") != null ? Long.valueOf(body.get("opportunityId").toString()) : null;

        Performance perf = new Performance();
        if (body.get("fitnessScore") != null) perf.setFitnessScore(Double.valueOf(body.get("fitnessScore").toString()));
        if (body.get("skillScore") != null) perf.setSkillScore(Double.valueOf(body.get("skillScore").toString()));
        if (body.get("matchPerformance") != null) perf.setMatchPerformance(Double.valueOf(body.get("matchPerformance").toString()));
        if (body.get("remarks") != null) perf.setRemarks((String) body.get("remarks"));
        if (body.get("evaluationDate") != null) {
            perf.setEvaluationDate(java.time.LocalDate.parse(body.get("evaluationDate").toString()));
        } else {
            perf.setEvaluationDate(java.time.LocalDate.now());
        }

        Performance saved = performanceService.recordPerformance(perf, studentId, coachId, opportunityId);
        return ResponseEntity.ok(ApiResponse.success("Performance recorded", saved));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Performance>>> getStudentPerformance(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(performanceService.getStudentPerformance(studentId)));
    }

    @GetMapping("/student/{studentId}/average")
    public ResponseEntity<ApiResponse<Double>> getAverageScore(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success("Average score", performanceService.getAverageScore(studentId)));
    }
}
