package com.hockeyconnect.controller;

import com.hockeyconnect.dto.response.AnalyticsOverview;
import com.hockeyconnect.dto.response.ApiResponse;
import com.hockeyconnect.service.impl.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AnalyticsOverview>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOverview()));
    }
}
