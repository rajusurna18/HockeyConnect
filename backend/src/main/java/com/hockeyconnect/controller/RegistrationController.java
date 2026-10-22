package com.hockeyconnect.controller;

import com.hockeyconnect.dto.response.ApiResponse;
import com.hockeyconnect.entity.CompetitionRegistration;
import com.hockeyconnect.entity.TrainingRegistration;
import com.hockeyconnect.repository.UserRepository;
import com.hockeyconnect.service.impl.RegistrationService;
import com.hockeyconnect.service.impl.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;
    private final StudentService studentService;
    private final UserRepository userRepository;

    // ===== TRAINING REGISTRATIONS =====

    @PostMapping("/training")
    public ResponseEntity<ApiResponse<TrainingRegistration>> registerForTraining(
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long opportunityId = body.get("opportunityId");
        Long studentId = body.get("studentId");

        if (studentId == null) {
            var user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            var student = studentService.getStudentByUserId(user.getId());
            studentId = student.getId();
        }

        TrainingRegistration reg = registrationService.registerForTraining(studentId, opportunityId);
        return ResponseEntity.ok(ApiResponse.success("Successfully registered for training!", reg));
    }

    @GetMapping("/training/student/{studentId}")
    public ResponseEntity<ApiResponse<List<TrainingRegistration>>> getStudentTrainings(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(registrationService.getStudentTrainings(studentId)));
    }

    @GetMapping("/training/my")
    public ResponseEntity<ApiResponse<List<TrainingRegistration>>> getMyTrainings(
            @AuthenticationPrincipal UserDetails userDetails) {
        var user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        var student = studentService.getStudentByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(registrationService.getStudentTrainings(student.getId())));
    }

    @GetMapping("/training/opportunity/{opportunityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<List<TrainingRegistration>>> getOpportunityRegistrations(@PathVariable Long opportunityId) {
        return ResponseEntity.ok(ApiResponse.success(registrationService.getOpportunityRegistrations(opportunityId)));
    }

    // ===== COMPETITION REGISTRATIONS =====

    @PostMapping("/competition")
    public ResponseEntity<ApiResponse<CompetitionRegistration>> registerForCompetition(
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long competitionId = body.get("competitionId");
        Long studentId = body.get("studentId");

        if (studentId == null) {
            var user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            var student = studentService.getStudentByUserId(user.getId());
            studentId = student.getId();
        }

        CompetitionRegistration reg = registrationService.registerForCompetition(studentId, competitionId);
        return ResponseEntity.ok(ApiResponse.success("Successfully registered for competition!", reg));
    }

    @GetMapping("/competition/my")
    public ResponseEntity<ApiResponse<List<CompetitionRegistration>>> getMyCompetitions(
            @AuthenticationPrincipal UserDetails userDetails) {
        var user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        var student = studentService.getStudentByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(registrationService.getStudentCompetitions(student.getId())));
    }

    @GetMapping("/competition/student/{studentId}")
    public ResponseEntity<ApiResponse<List<CompetitionRegistration>>> getStudentCompetitions(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(registrationService.getStudentCompetitions(studentId)));
    }

    @GetMapping("/competition/{competitionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<List<CompetitionRegistration>>> getCompetitionRegistrations(@PathVariable Long competitionId) {
        return ResponseEntity.ok(ApiResponse.success(registrationService.getCompetitionRegistrations(competitionId)));
    }

    @PutMapping("/competition/{regId}/result")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<CompetitionRegistration>> updateResult(
            @PathVariable Long regId,
            @RequestBody Map<String, Object> body) {
        String result = (String) body.get("result");
        Integer rank = body.get("rank") != null ? ((Number) body.get("rank")).intValue() : null;
        return ResponseEntity.ok(ApiResponse.success(registrationService.updateCompetitionResult(regId, result, rank)));
    }
}
