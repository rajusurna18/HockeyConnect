package com.hockeyconnect.excel;

import com.hockeyconnect.entity.*;
import com.hockeyconnect.repository.*;
import com.hockeyconnect.service.impl.StudentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final OpportunityRepository opportunityRepository;
    private final AttendanceRepository attendanceRepository;
    private final CompetitionRepository competitionRepository;
    private final TrainingRegistrationRepository trainingRegRepo;
    private final CoachRepository coachRepository;
    private final PasswordEncoder passwordEncoder;

    // ===========================
    // IMPORT STUDENTS
    // ===========================
    @Transactional
    public Map<String, Object> importStudents(MultipartFile file) throws IOException {
        List<String> errors = new ArrayList<>();
        List<String> successes = new ArrayList<>();
        int total = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                errors.add("No sheet found in workbook");
                return buildResult(0, 0, errors, successes);
            }

            // Skip header row
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;
                total++;

                try {
                    String name = getCellValue(row, 0);
                    String ageStr = getCellValue(row, 1);
                    String gender = getCellValue(row, 2);
                    String institution = getCellValue(row, 3);
                    String location = getCellValue(row, 4);
                    String skillLevelStr = getCellValue(row, 5);
                    String expStr = getCellValue(row, 6);
                    String email = getCellValue(row, 7);
                    String phone = getCellValue(row, 8);
                    String preferredDays = getCellValue(row, 9);
                    String preferredTime = getCellValue(row, 10);

                    // Validate required fields
                    if (name == null || name.isBlank()) {
                        errors.add("Row " + (i + 1) + ": Name is required");
                        continue;
                    }
                    if (email == null || email.isBlank() || !email.contains("@")) {
                        errors.add("Row " + (i + 1) + ": Valid email is required");
                        continue;
                    }

                    // Validate age
                    int age = 0;
                    try {
                        age = Integer.parseInt(ageStr != null ? ageStr.trim() : "0");
                        if (age < 5 || age > 100) throw new NumberFormatException();
                    } catch (NumberFormatException e) {
                        errors.add("Row " + (i + 1) + ": Invalid age '" + ageStr + "'");
                        continue;
                    }

                    // Validate skill level
                    Student.SkillLevel skillLevel;
                    try {
                        skillLevel = Student.SkillLevel.valueOf(
                                skillLevelStr != null ? skillLevelStr.trim().toUpperCase() : "BEGINNER");
                    } catch (IllegalArgumentException e) {
                        errors.add("Row " + (i + 1) + ": Invalid skill level '" + skillLevelStr + "'. Use BEGINNER/INTERMEDIATE/ADVANCED");
                        continue;
                    }

                    // Check duplicate email
                    if (userRepository.existsByEmail(email.trim())) {
                        errors.add("Row " + (i + 1) + ": Email '" + email + "' already exists");
                        continue;
                    }

                    // Create user
                    User user = User.builder()
                            .name(name.trim())
                            .email(email.trim().toLowerCase())
                            .password(passwordEncoder.encode("Hockey@123"))
                            .role(User.Role.STUDENT)
                            .build();
                    user = userRepository.save(user);

                    // Create student profile
                    int expYears = 0;
                    try { expYears = Integer.parseInt(expStr != null ? expStr.trim() : "0"); } catch (Exception ignored) {}

                    Student student = Student.builder()
                            .user(user)
                            .fullName(name.trim())
                            .age(age)
                            .gender(gender)
                            .institution(institution)
                            .location(location)
                            .skillLevel(skillLevel)
                            .experienceYears(expYears)
                            .phone(phone)
                            .preferredDays(preferredDays)
                            .preferredTime(preferredTime)
                            .participationStatus(Student.ParticipationStatus.REGISTERED)
                            .build();
                    studentRepository.save(student);

                    successes.add("Row " + (i + 1) + ": Student '" + name + "' imported successfully");

                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                    log.error("Error processing row {}: {}", i + 1, e.getMessage());
                }
            }
        }

        return buildResult(total, successes.size(), errors, successes);
    }

    // ===========================
    // EXPORT STUDENTS
    // ===========================
    public byte[] exportStudents() throws IOException {
        List<Student> students = studentRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Students");

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Header row
            String[] headers = {"ID", "Name", "Age", "Gender", "Institution", "Location",
                    "SkillLevel", "ExperienceYears", "Email", "Phone",
                    "PreferredDays", "PreferredTime", "ParticipationStatus", "CreatedAt"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 1;
            for (Student s : students) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(s.getId());
                row.createCell(1).setCellValue(s.getFullName());
                row.createCell(2).setCellValue(s.getAge() != null ? s.getAge() : 0);
                row.createCell(3).setCellValue(s.getGender() != null ? s.getGender() : "");
                row.createCell(4).setCellValue(s.getInstitution() != null ? s.getInstitution() : "");
                row.createCell(5).setCellValue(s.getLocation() != null ? s.getLocation() : "");
                row.createCell(6).setCellValue(s.getSkillLevel() != null ? s.getSkillLevel().name() : "");
                row.createCell(7).setCellValue(s.getExperienceYears() != null ? s.getExperienceYears() : 0);
                row.createCell(8).setCellValue(s.getUser() != null ? s.getUser().getEmail() : "");
                row.createCell(9).setCellValue(s.getPhone() != null ? s.getPhone() : "");
                row.createCell(10).setCellValue(s.getPreferredDays() != null ? s.getPreferredDays() : "");
                row.createCell(11).setCellValue(s.getPreferredTime() != null ? s.getPreferredTime() : "");
                row.createCell(12).setCellValue(s.getParticipationStatus() != null ? s.getParticipationStatus().name() : "");
                row.createCell(13).setCellValue(s.getCreatedAt() != null ? s.getCreatedAt().toString() : "");
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // ===========================
    // EXPORT ANALYTICS
    // ===========================
    public byte[] exportAnalyticsReport() throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Summary Sheet
            Sheet summary = workbook.createSheet("Analytics Summary");
            CellStyle boldStyle = workbook.createCellStyle();
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            boldStyle.setFont(boldFont);

            long totalStudents = studentRepository.count();
            long totalOpportunities = opportunityRepository.count();
            long totalCompetitions = competitionRepository.count();
            long totalRegs = trainingRegRepo.count();

            Object[][] summaryData = {
                {"HockeyConnect Analytics Report", "Generated: " + LocalDateTime.now()},
                {"", ""},
                {"Metric", "Value"},
                {"Total Students", totalStudents},
                {"Total Coaches", getCoachCount()},
                {"Total Opportunities", totalOpportunities},
                {"Total Competitions", totalCompetitions},
                {"Total Registrations", totalRegs},
                {"Beginner Students", studentRepository.countBySkillLevel(Student.SkillLevel.BEGINNER)},
                {"Intermediate Students", studentRepository.countBySkillLevel(Student.SkillLevel.INTERMEDIATE)},
                {"Advanced Students", studentRepository.countBySkillLevel(Student.SkillLevel.ADVANCED)},
            };

            for (int i = 0; i < summaryData.length; i++) {
                Row row = summary.createRow(i);
                for (int j = 0; j < summaryData[i].length; j++) {
                    Cell cell = row.createCell(j);
                    Object val = summaryData[i][j];
                    if (val instanceof Number) {
                        cell.setCellValue(((Number) val).doubleValue());
                    } else {
                        cell.setCellValue(val != null ? val.toString() : "");
                    }
                    if (i == 0 || i == 2) cell.setCellStyle(boldStyle);
                }
            }
            summary.autoSizeColumn(0);
            summary.autoSizeColumn(1);

            // Students Sheet
            Sheet studentsSheet = workbook.createSheet("Students Data");
            byte[] studentsData = exportStudents();
            // We can't copy raw bytes, so just add a note
            Row note = studentsSheet.createRow(0);
            note.createCell(0).setCellValue("See Students export for full data");

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // ===========================
    // GENERATE STUDENT TEMPLATE
    // ===========================
    public byte[] generateStudentTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Students");
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] headers = {"name*", "age*", "gender", "institution", "location",
                    "skillLevel (BEGINNER/INTERMEDIATE/ADVANCED)", "experienceYears",
                    "email*", "phone", "preferredDays", "preferredTime"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Sample row
            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("Arjun Sharma");
            sampleRow.createCell(1).setCellValue(17);
            sampleRow.createCell(2).setCellValue("Male");
            sampleRow.createCell(3).setCellValue("St. Mary's School Hyderabad");
            sampleRow.createCell(4).setCellValue("Hyderabad");
            sampleRow.createCell(5).setCellValue("BEGINNER");
            sampleRow.createCell(6).setCellValue(1);
            sampleRow.createCell(7).setCellValue("arjun.sharma@example.com");
            sampleRow.createCell(8).setCellValue("9876543210");
            sampleRow.createCell(9).setCellValue("Saturday,Sunday");
            sampleRow.createCell(10).setCellValue("Morning");

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // ===========================
    // HELPER METHODS
    // ===========================
    private String getCellValue(Row row, int colIndex) {
        Cell cell = row.getCell(colIndex);
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getDateCellValue().toString();
                }
                yield String.valueOf((long) cell.getNumericCellValue());
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> null;
        };
    }

    private boolean isRowEmpty(Row row) {
        for (int i = row.getFirstCellNum(); i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    private Map<String, Object> buildResult(int total, int success, List<String> errors, List<String> successes) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRows", total);
        result.put("successCount", success);
        result.put("errorCount", errors.size());
        result.put("errors", errors);
        result.put("successes", successes);
        return result;
    }

    private long getCoachCount() {
        return coachRepository.count();
    }
}
