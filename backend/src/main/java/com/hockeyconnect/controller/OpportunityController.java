package com.hockeyconnect.controller;

import com.hockeyconnect.dto.response.ApiResponse;
import com.hockeyconnect.entity.Opportunity;
import com.hockeyconnect.service.impl.OpportunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/opportunities")
@RequiredArgsConstructor
public class OpportunityController {

    private final OpportunityService opportunityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Opportunity>>> getAllOpportunities(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String skillLevel,
            @RequestParam(required = false) String location) {

        List<Opportunity> result;
        if ((type != null && !type.isBlank()) || (skillLevel != null && !skillLevel.isBlank())
                || (location != null && !location.isBlank())) {
            result = opportunityService.searchOpportunities(type, skillLevel, location);
        } else {
            result = opportunityService.getActiveOpportunities();
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<List<Opportunity>>> getAllOpportunitiesAdmin() {
        return ResponseEntity.ok(ApiResponse.success(opportunityService.getAllOpportunities()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Opportunity>> getOpportunityById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(opportunityService.getOpportunityById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<Opportunity>> createOpportunity(@RequestBody Opportunity opportunity) {
        return ResponseEntity.ok(ApiResponse.success("Opportunity created", opportunityService.createOpportunity(opportunity)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<Opportunity>> updateOpportunity(@PathVariable Long id, @RequestBody Opportunity opportunity) {
        return ResponseEntity.ok(ApiResponse.success("Opportunity updated", opportunityService.updateOpportunity(id, opportunity)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<Void>> deleteOpportunity(@PathVariable Long id) {
        opportunityService.deleteOpportunity(id);
        return ResponseEntity.ok(ApiResponse.success("Opportunity deleted", null));
    }
}
