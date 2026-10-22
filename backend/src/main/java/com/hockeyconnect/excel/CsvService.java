
package com.hockeyconnect.excel;

import com.hockeyconnect.entity.Competition;
import com.hockeyconnect.entity.CompetitionRegistration;
import com.hockeyconnect.entity.Player;
import com.hockeyconnect.entity.Student;
import com.hockeyconnect.repository.CompetitionRegistrationRepository;
import com.hockeyconnect.repository.CompetitionRepository;
import com.hockeyconnect.repository.PlayerRepository;
import com.hockeyconnect.repository.StudentRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class CsvService {

    private final PlayerRepository playerRepository;
    private final CompetitionRepository competitionRepository;
    private final CompetitionRegistrationRepository registrationRepository;
    private final StudentRepository studentRepository;

    public CsvService(PlayerRepository playerRepository,
                      CompetitionRepository competitionRepository,
                      CompetitionRegistrationRepository registrationRepository,
                      StudentRepository studentRepository) {
        this.playerRepository = playerRepository;
        this.competitionRepository = competitionRepository;
        this.registrationRepository = registrationRepository;
        this.studentRepository = studentRepository;
    }

    public List<Map<String, String>> importCsv(MultipartFile file)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please upload a non-empty CSV file.");
        }

        if (file.getOriginalFilename() == null ||
                !file.getOriginalFilename().toLowerCase(Locale.ROOT)
                        .endsWith(".csv")) {
            throw new IllegalArgumentException(
                    "Only CSV files are supported.");
        }

        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .get();

        try (Reader reader = new InputStreamReader(
                    file.getInputStream(), StandardCharsets.UTF_8);
             CSVParser parser = format.parse(reader)) {

            List<Map<String, String>> rows = new ArrayList<>();

            for (CSVRecord record : parser) {
                Map<String, String> row = new LinkedHashMap<>();

                for (String header : parser.getHeaderNames()) {
                    row.put(header.trim(), record.get(header).trim());
                }

                rows.add(row);
            }

            return rows;
        }
    }

    // ========================
    // PLAYER IMPORT / EXPORT
    // ========================

    @Transactional
    public Map<String, Object> importPlayers(MultipartFile file)
            throws IOException {

        List<Map<String, String>> rows = importCsv(file);

        if (rows.isEmpty()) {
            throw new IllegalArgumentException(
                    "The CSV file contains no player rows.");
        }

        int saved = 0;
        int updated = 0;

        for (Map<String, String> row : rows) {

            String playerId = getValue(row, "PlayerID");
            String name = getValue(row, "Name");

            if (playerId.isBlank() || name.isBlank()) {
                throw new IllegalArgumentException(
                        "PlayerID and Name are required for every row.");
            }

            Player player = playerRepository.findByPlayerId(playerId)
                    .orElseGet(() -> Player.builder()
                            .playerId(playerId)
                            .build());

            boolean existing = player.getId() != null;

            player.setName(name);
            player.setAge(parseInteger(getValue(row, "Age"), "Age"));
            player.setPosition(getValue(row, "Position"));
            player.setTeamId(getValue(row, "TeamID"));
            player.setJerseyNumber(
                    parseInteger(getValue(row, "JerseyNumber"),
                            "JerseyNumber"));

            playerRepository.save(player);

            if (existing) {
                updated++;
            } else {
                saved++;
            }
        }

        return Map.of(
                "message", "Player CSV imported successfully",
                "totalRows", rows.size(),
                "saved", saved,
                "updated", updated
        );
    }

    public List<Map<String, String>> exportPlayers() {

        List<Map<String, String>> rows = new ArrayList<>();

        for (Player player : playerRepository.findAll()) {
            Map<String, String> row = new LinkedHashMap<>();

            row.put("PlayerID", player.getPlayerId());
            row.put("Name", player.getName());
            row.put("Age", valueOf(player.getAge()));
            row.put("Position", valueOf(player.getPosition()));
            row.put("TeamID", valueOf(player.getTeamId()));
            row.put("JerseyNumber", valueOf(player.getJerseyNumber()));

            rows.add(row);
        }

        return rows;
    }

    // ========================
    // COMPETITION EXPORT
    // ========================

    /**
     * Columns: CompetitionID, Title, Organizer, Location, StartDate, EndDate,
     *          SkillLevel, MaxParticipants, Status, Prize
     */
    public List<Map<String, String>> exportCompetitions() {

        List<Map<String, String>> rows = new ArrayList<>();

        for (Competition c : competitionRepository.findAll()) {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("CompetitionID", valueOf(c.getId()));
            row.put("Title", valueOf(c.getTitle()));
            row.put("Organizer", valueOf(c.getOrganizer()));
            row.put("Location", valueOf(c.getLocation()));
            row.put("StartDate", valueOf(c.getStartDate()));
            row.put("EndDate", valueOf(c.getEndDate()));
            row.put("SkillLevel", c.getSkillLevel() == null ? "" : c.getSkillLevel().name());
            row.put("MaxParticipants", valueOf(c.getMaxParticipants()));
            row.put("Status", c.getStatus() == null ? "" : c.getStatus().name());
            row.put("Prize", valueOf(c.getPrize()));
            rows.add(row);
        }

        return rows;
    }

    // ========================
    // RESULTS (COMPETITION REGISTRATIONS) EXPORT
    // ========================

    /**
     * Columns: RegistrationID, CompetitionID, CompetitionTitle, StudentID,
     *          StudentName, Status, Result, Rank
     */
    public List<Map<String, String>> exportResults() {

        List<Map<String, String>> rows = new ArrayList<>();

        for (CompetitionRegistration r : registrationRepository.findAll()) {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("RegistrationID", valueOf(r.getId()));
            row.put("CompetitionID", r.getCompetition() == null ? "" : valueOf(r.getCompetition().getId()));
            row.put("CompetitionTitle", r.getCompetition() == null ? "" : valueOf(r.getCompetition().getTitle()));
            row.put("StudentID", r.getStudent() == null ? "" : valueOf(r.getStudent().getId()));
            row.put("StudentName", r.getStudent() == null ? "" : valueOf(r.getStudent().getFullName()));
            row.put("Status", r.getStatus() == null ? "" : r.getStatus().name());
            row.put("Result", valueOf(r.getResult()));
            row.put("Rank", valueOf(r.getRank()));
            rows.add(row);
        }

        return rows;
    }

    // ========================
    // RESULTS IMPORT (update result/rank for existing registrations)
    // ========================

    /**
     * Required CSV columns: RegistrationID, Result (optional), Rank (optional), Status (optional)
     * Only updates existing registrations; does not create new ones.
     */
    @Transactional
    public Map<String, Object> importResults(MultipartFile file) throws IOException {

        List<Map<String, String>> rows = importCsv(file);

        if (rows.isEmpty()) {
            throw new IllegalArgumentException("The CSV file contains no result rows.");
        }

        int updated = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            int rowNum = i + 2; // 1-indexed + header
            Map<String, String> row = rows.get(i);

            String regIdStr = getValue(row, "RegistrationID");
            if (regIdStr.isBlank()) {
                errors.add("Row " + rowNum + ": RegistrationID is required");
                failed++;
                continue;
            }

            Long regId;
            try {
                regId = Long.parseLong(regIdStr.trim());
            } catch (NumberFormatException e) {
                errors.add("Row " + rowNum + ": RegistrationID must be a number, got: " + regIdStr);
                failed++;
                continue;
            }

            CompetitionRegistration reg = registrationRepository.findById(regId).orElse(null);
            if (reg == null) {
                errors.add("Row " + rowNum + ": RegistrationID " + regId + " not found");
                failed++;
                continue;
            }

            String result = getValue(row, "Result");
            String rankStr = getValue(row, "Rank");
            String statusStr = getValue(row, "Status");

            if (!result.isBlank()) {
                reg.setResult(result);
            }
            if (!rankStr.isBlank()) {
                try {
                    reg.setRank(Integer.parseInt(rankStr.trim()));
                } catch (NumberFormatException e) {
                    errors.add("Row " + rowNum + ": Rank must be a number, got: " + rankStr);
                    failed++;
                    continue;
                }
            }
            if (!statusStr.isBlank()) {
                try {
                    reg.setStatus(CompetitionRegistration.Status.valueOf(statusStr.trim().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    errors.add("Row " + rowNum + ": Invalid status '" + statusStr
                            + "'. Valid: REGISTERED, CONFIRMED, PARTICIPATED, WITHDRAWN");
                    failed++;
                    continue;
                }
            }

            registrationRepository.save(reg);
            updated++;
        }

        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("message", "Results import complete");
        result.put("totalRows", rows.size());
        result.put("updated", updated);
        result.put("failed", failed);
        result.put("errors", errors);
        return result;
    }

    // ========================
    // GENERIC CSV EXPORT
    // ========================

    public byte[] exportCsv(
            List<String> headers,
            List<Map<String, String>> rows) throws IOException {

        if (headers == null || headers.isEmpty()) {
            throw new IllegalArgumentException(
                    "CSV headers are required.");
        }

        ByteArrayOutputStream output = new ByteArrayOutputStream();

        try (Writer writer = new OutputStreamWriter(
                    output, StandardCharsets.UTF_8);
             CSVPrinter printer = new CSVPrinter(
                    writer, CSVFormat.DEFAULT)) {

            printer.printRecord(headers);

            for (Map<String, String> row : rows) {
                List<String> values = new ArrayList<>();

                for (String header : headers) {
                    values.add(row.getOrDefault(header, ""));
                }

                printer.printRecord(values);
            }
        }

        return output.toByteArray();
    }

    // ========================
    // HELPERS
    // ========================

    private String getValue(
            Map<String, String> row, String columnName) {

        for (Map.Entry<String, String> entry : row.entrySet()) {
            if (entry.getKey().trim().equalsIgnoreCase(columnName)) {
                return entry.getValue() == null
                        ? "" : entry.getValue().trim();
            }
        }

        return "";
    }

    private Integer parseInteger(String value, String fieldName) {

        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(
                    "Invalid number in column " + fieldName
                            + ": " + value);
        }
    }

    private String valueOf(Object value) {
        return value == null ? "" : value.toString();
    }
}
