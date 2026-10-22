package com.hockeyconnect.controller;

import com.hockeyconnect.dto.response.ApiResponse;
import com.hockeyconnect.excel.ExcelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/excel")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class ExcelController {

    private final ExcelService excelService;

    @PostMapping("/import/students")
    public ResponseEntity<ApiResponse<Map<String, Object>>> importStudents(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
            }
            String filename = file.getOriginalFilename();
            if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Only Excel files (.xlsx, .xls) are accepted"));
            }
            Map<String, Object> result = excelService.importStudents(file);
            int success = (int) result.get("successCount");
            int errors = (int) result.get("errorCount");
            String msg = String.format("Import complete: %d students imported, %d errors", success, errors);
            return ResponseEntity.ok(ApiResponse.success(msg, result));
        } catch (IOException e) {
            log.error("Excel import error: {}", e.getMessage());
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to process file: " + e.getMessage()));
        }
    }

    @GetMapping("/export/students")
    public ResponseEntity<byte[]> exportStudents() {
        try {
            byte[] data = excelService.exportStudents();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=students_" + LocalDate.now() + ".xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (IOException e) {
            log.error("Excel export error: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/export/analytics")
    public ResponseEntity<byte[]> exportAnalytics() {
        try {
            byte[] data = excelService.exportAnalyticsReport();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=analytics_report_" + LocalDate.now() + ".xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (IOException e) {
            log.error("Analytics export error: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/template/students")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadStudentTemplate() {
        try {
            byte[] data = excelService.generateStudentTemplate();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=student_import_template.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
}
