package com.hockeyconnect.controller;

import com.hockeyconnect.dto.response.ApiResponse;
import com.hockeyconnect.entity.Student;
import com.hockeyconnect.recommendation.RecommendationEngine;
import com.hockeyconnect.repository.UserRepository;
import com.hockeyconnect.service.impl.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final UserRepository userRepository;
    private final RecommendationEngine recommendationEngine;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<List<Student>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.success(studentService.getAllStudents()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Student>> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentById(id)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Student>> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        var user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentService.getStudentByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(student));
    }

    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<Student>> createOrUpdateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Student student) {
        var user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student saved = studentService.createOrUpdateProfile(user.getId(), student);
        return ResponseEntity.ok(ApiResponse.success("Profile saved successfully", saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<Student>> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        return ResponseEntity.ok(ApiResponse.success("Student updated", studentService.updateStudent(id, student)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted", null));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<?>>> getRecommendations(
            @AuthenticationPrincipal UserDetails userDetails) {
        var user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentService.getStudentByUserId(user.getId());
        var recommendations = recommendationEngine.recommend(student, 6);
        return ResponseEntity.ok(ApiResponse.success("Smart Opportunity Recommendations", recommendations));
    }
}
