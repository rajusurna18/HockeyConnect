package com.hockeyconnect.controller;

import com.hockeyconnect.dto.response.ApiResponse;
import com.hockeyconnect.entity.Competition;
import com.hockeyconnect.exception.ResourceNotFoundException;
import com.hockeyconnect.repository.CompetitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/competitions")
@RequiredArgsConstructor
public class CompetitionController {

    private final CompetitionRepository competitionRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Competition>>> getAllCompetitions() {
        return ResponseEntity.ok(ApiResponse.success(competitionRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Competition>> getCompetitionById(@PathVariable Long id) {
        Competition c = competitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Competition", id));
        return ResponseEntity.ok(ApiResponse.success(c));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<Competition>> createCompetition(@RequestBody Competition competition) {
        return ResponseEntity.ok(ApiResponse.success("Competition created", competitionRepository.save(competition)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<Competition>> updateCompetition(@PathVariable Long id, @RequestBody Competition data) {
        Competition comp = competitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Competition", id));
        if (data.getTitle() != null) comp.setTitle(data.getTitle());
        if (data.getOrganizer() != null) comp.setOrganizer(data.getOrganizer());
        if (data.getLocation() != null) comp.setLocation(data.getLocation());
        if (data.getStartDate() != null) comp.setStartDate(data.getStartDate());
        if (data.getEndDate() != null) comp.setEndDate(data.getEndDate());
        if (data.getStatus() != null) comp.setStatus(data.getStatus());
        if (data.getDescription() != null) comp.setDescription(data.getDescription());
        if (data.getPrize() != null) comp.setPrize(data.getPrize());
        if (data.getSkillLevel() != null) comp.setSkillLevel(data.getSkillLevel());
        return ResponseEntity.ok(ApiResponse.success("Competition updated", competitionRepository.save(comp)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCompetition(@PathVariable Long id) {
        if (!competitionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Competition", id);
        }
        competitionRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Competition deleted", null));
    }
}
