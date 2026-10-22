package com.hockeyconnect.controller;

import com.hockeyconnect.dto.response.ApiResponse;
import com.hockeyconnect.entity.Attendance;
import com.hockeyconnect.service.impl.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<Attendance>> markAttendance(@RequestBody Map<String, Object> body) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Long opportunityId = Long.valueOf(body.get("opportunityId").toString());
        LocalDate date = LocalDate.parse(body.get("date").toString());
        Attendance.AttendanceStatus status = Attendance.AttendanceStatus.valueOf(
                body.getOrDefault("status", "PRESENT").toString().toUpperCase());
        String remarks = (String) body.get("remarks");
        Long coachId = body.get("coachId") != null ? Long.valueOf(body.get("coachId").toString()) : null;

        Attendance attendance = attendanceService.markAttendance(studentId, opportunityId, date, status, remarks, coachId);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked", attendance));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Attendance>>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getStudentAttendance(studentId)));
    }

    @GetMapping("/student/{studentId}/percentage")
    public ResponseEntity<ApiResponse<Double>> getAttendancePercentage(@PathVariable Long studentId) {
        double pct = attendanceService.getAttendancePercentage(studentId);
        return ResponseEntity.ok(ApiResponse.success("Attendance percentage", pct));
    }

    @GetMapping("/opportunity/{opportunityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getOpportunityAttendance(@PathVariable Long opportunityId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getOpportunityAttendance(opportunityId)));
    }
}
