package com.hockeyconnect.controller;

import com.hockeyconnect.dto.response.ApiResponse;
import com.hockeyconnect.entity.Coach;
import com.hockeyconnect.entity.User;
import com.hockeyconnect.exception.ResourceNotFoundException;
import com.hockeyconnect.repository.CoachRepository;
import com.hockeyconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/coaches")
@RequiredArgsConstructor
public class CoachController {

    private final CoachRepository coachRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Coach>>> getAllCoaches() {
        return ResponseEntity.ok(ApiResponse.success(coachRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Coach>> getCoachById(@PathVariable Long id) {
        Coach coach = coachRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coach", id));
        return ResponseEntity.ok(ApiResponse.success(coach));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('COACH')")
    public ResponseEntity<ApiResponse<Coach>> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Coach coach = coachRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Coach profile not found"));
        return ResponseEntity.ok(ApiResponse.success(coach));
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('COACH')")
    public ResponseEntity<ApiResponse<Coach>> createOrUpdateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Coach coachData) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Coach coach = coachRepository.findByUserId(user.getId()).orElse(new Coach());
        coach.setUser(user);
        coach.setFullName(coachData.getFullName() != null ? coachData.getFullName() : user.getName());
        coach.setPhone(coachData.getPhone());
        coach.setSpecialization(coachData.getSpecialization());
        coach.setLocation(coachData.getLocation());
        coach.setInstitution(coachData.getInstitution());
        coach.setExperienceYears(coachData.getExperienceYears());
        coach.setCertifications(coachData.getCertifications());
        coach.setBio(coachData.getBio());

        return ResponseEntity.ok(ApiResponse.success("Coach profile saved", coachRepository.save(coach)));
    }
}
