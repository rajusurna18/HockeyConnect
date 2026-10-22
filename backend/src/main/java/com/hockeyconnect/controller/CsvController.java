
package com.hockeyconnect.controller;

import com.hockeyconnect.excel.CsvService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/csv")
@RequiredArgsConstructor
public class CsvController {

    private final CsvService csvService;

    // ======================================================
    // GENERIC / UTILITY
    // ======================================================

    // Parse a CSV without saving it to the database
    @PostMapping(
            value = "/import",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importCsv(
            @RequestParam("file") MultipartFile file) throws IOException {

        List<Map<String, String>> rows = csvService.importCsv(file);

        return ResponseEntity.ok(Map.of(
                "message", "CSV parsed successfully",
                "rowCount", rows.size(),
                "data", rows
        ));
    }

    // Generic CSV export
    @PostMapping(
            value = "/export",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestBody CsvExportRequest request) throws IOException {

        byte[] csv = csvService.exportCsv(
                request.headers(), request.rows());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"hockey-connect.csv\"")
                .contentType(new MediaType(
                        "text", "csv", StandardCharsets.UTF_8))
                .body(csv);
    }

    // ======================================================
    // PLAYERS
    // ======================================================

    // Import player records and save them to the database
    @PostMapping(
            value = "/players/import",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importPlayers(
            @RequestParam("file") MultipartFile file) throws IOException {

        Map<String, Object> result = csvService.importPlayers(file);
        return ResponseEntity.ok(result);
    }

    // Export all saved player records as a downloadable CSV
    @GetMapping(value = "/players/export", produces = "text/csv")
    public ResponseEntity<ByteArrayResource> exportPlayers() throws IOException {

        List<String> headers = List.of(
                "PlayerID", "Name", "Age",
                "Position", "TeamID", "JerseyNumber");

        byte[] csv = csvService.exportCsv(
                headers, csvService.exportPlayers());

        ByteArrayResource resource = new ByteArrayResource(csv);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"hockey-players.csv\"")
                .contentType(new MediaType(
                        "text", "csv", StandardCharsets.UTF_8))
                .contentLength(csv.length)
                .body(resource);
    }

    // ======================================================
    // COMPETITIONS
    // ======================================================

    // Export all competitions as a downloadable CSV
    @GetMapping(value = "/competitions/export", produces = "text/csv")
    public ResponseEntity<ByteArrayResource> exportCompetitions() throws IOException {

        List<String> headers = List.of(
                "CompetitionID", "Title", "Organizer", "Location",
                "StartDate", "EndDate", "SkillLevel", "MaxParticipants",
                "Status", "Prize");

        byte[] csv = csvService.exportCsv(
                headers, csvService.exportCompetitions());

        ByteArrayResource resource = new ByteArrayResource(csv);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"hockey-competitions.csv\"")
                .contentType(new MediaType(
                        "text", "csv", StandardCharsets.UTF_8))
                .contentLength(csv.length)
                .body(resource);
    }

    // ======================================================
    // RESULTS (Competition Registrations)
    // ======================================================

    // Export competition results (registrations with result/rank) as CSV
    @GetMapping(value = "/results/export", produces = "text/csv")
    public ResponseEntity<ByteArrayResource> exportResults() throws IOException {

        List<String> headers = List.of(
                "RegistrationID", "CompetitionID", "CompetitionTitle",
                "StudentID", "StudentName", "Status", "Result", "Rank");

        byte[] csv = csvService.exportCsv(
                headers, csvService.exportResults());

        ByteArrayResource resource = new ByteArrayResource(csv);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"hockey-results.csv\"")
                .contentType(new MediaType(
                        "text", "csv", StandardCharsets.UTF_8))
                .contentLength(csv.length)
                .body(resource);
    }

    // Import result updates (updates result/rank/status on existing registrations)
    @PostMapping(
            value = "/results/import",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importResults(
            @RequestParam("file") MultipartFile file) throws IOException {

        Map<String, Object> result = csvService.importResults(file);
        return ResponseEntity.ok(result);
    }

    // ======================================================
    // RECORD TYPE
    // ======================================================

    public record CsvExportRequest(
            List<String> headers,
            List<Map<String, String>> rows) {
    }
}
