package com.hockeyconnect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hockeyconnect.entity.*;
import com.hockeyconnect.repository.*;
import com.hockeyconnect.service.impl.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class HockeyConnectApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @Autowired
    private TrainingRegistrationRepository registrationRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PerformanceRepository performanceRepository;

    @Autowired
    private AnalyticsService analyticsService;

    private static String studentToken;
    private static String coachToken;
    private static String adminToken;
    private static Long studentId;
    private static Long opportunityId;

    // ==========================================
    // PHASE 1: AUTHENTICATION TESTS
    // ==========================================

    @Test
    @Order(1)
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @Order(2)
    void testStudentRegistration() throws Exception {
        Map<String, String> request = Map.of(
                "name", "Test Student",
                "email", "test.student@test.com",
                "password", "Test@123",
                "role", "STUDENT"
        );

        MvcResult result = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.role").value("STUDENT"))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        var response = objectMapper.readTree(body);
        studentToken = response.get("data").get("token").asText();
        assertThat(studentToken).isNotEmpty();
    }

    @Test
    @Order(3)
    void testDuplicateRegistration() throws Exception {
        Map<String, String> request = Map.of(
                "name", "Duplicate Student",
                "email", "test.student@test.com",
                "password", "Test@123",
                "role", "STUDENT"
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(4)
    void testCoachRegistrationAndLogin() throws Exception {
        // Register coach
        Map<String, String> regRequest = Map.of(
                "name", "Test Coach",
                "email", "test.coach@test.com",
                "password", "Test@123",
                "role", "COACH"
        );
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isOk());

        // Login coach
        Map<String, String> loginRequest = Map.of(
                "email", "test.coach@test.com",
                "password", "Test@123"
        );
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("COACH"))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        coachToken = objectMapper.readTree(body).get("data").get("token").asText();
        assertThat(coachToken).isNotEmpty();
    }

    @Test
    @Order(5)
    void testAdminLogin() throws Exception {
        // Admin is seeded in DataSeeder
        Map<String, String> loginRequest = Map.of(
                "email", "admin@hockeyconnect.com",
                "password", "Admin@123"
        );
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andReturn();

        adminToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("data").get("token").asText();
        assertThat(adminToken).isNotEmpty();
    }

    @Test
    @Order(6)
    void testInvalidLogin() throws Exception {
        Map<String, String> request = Map.of(
                "email", "wrong@test.com",
                "password", "wrongpassword"
        );
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // ==========================================
    // PHASE 2: STUDENT PROFILE TESTS
    // ==========================================

    @Test
    @Order(10)
    void testCreateStudentProfile() throws Exception {
        Map<String, Object> profile = Map.of(
                "fullName", "Test Student",
                "age", 18,
                "gender", "Male",
                "institution", "Test University",
                "location", "Hyderabad",
                "skillLevel", "BEGINNER",
                "experienceYears", 1,
                "preferredDays", "Saturday",
                "preferredTime", "Morning"
        );

        MvcResult result = mockMvc.perform(post("/students/profile")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profile)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.institution").value("Test University"))
                .andReturn();

        var data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        studentId = data.get("id").asLong();
        assertThat(studentId).isPositive();
    }

    @Test
    @Order(11)
    void testGetStudentProfile() throws Exception {
        mockMvc.perform(get("/students/me")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.institution").value("Test University"));
    }

    // ==========================================
    // PHASE 3: OPPORTUNITY TESTS
    // ==========================================

    @Test
    @Order(20)
    void testGetOpportunities() throws Exception {
        mockMvc.perform(get("/opportunities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(21)
    void testCreateOpportunity() throws Exception {
        Map<String, Object> opp = Map.of(
                "title", "Test Training Session",
                "type", "TRAINING",
                "organizer", "Test Org",
                "location", "Hyderabad",
                "skillLevel", "BEGINNER",
                "availableSeats", 5,
                "totalSeats", 5,
                "description", "Test training opportunity",
                "date", LocalDate.now().plusDays(5).toString()
        );

        MvcResult result = mockMvc.perform(post("/opportunities")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(opp)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Test Training Session"))
                .andReturn();

        var data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        opportunityId = data.get("id").asLong();
        assertThat(opportunityId).isPositive();
    }

    // ==========================================
    // PHASE 4: REGISTRATION TESTS
    // ==========================================

    @Test
    @Order(30)
    void testRegisterForTraining() throws Exception {
        assertThat(studentId).isNotNull();
        assertThat(opportunityId).isNotNull();

        Map<String, Long> body = Map.of("opportunityId", opportunityId);

        mockMvc.perform(post("/registrations/training")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));

        // Verify seats reduced
        Opportunity opp = opportunityRepository.findById(opportunityId).orElseThrow();
        assertThat(opp.getAvailableSeats()).isEqualTo(4);
    }

    @Test
    @Order(31)
    void testPreventDuplicateTrainingRegistration() throws Exception {
        assertThat(studentId).isNotNull();

        Map<String, Long> body = Map.of("opportunityId", opportunityId);

        mockMvc.perform(post("/registrations/training")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(32)
    void testCapacityValidation() throws Exception {
        // Create an opportunity with 0 seats
        Map<String, Object> opp = Map.of(
                "title", "Full Training",
                "type", "TRAINING",
                "organizer", "Test Org",
                "location", "Hyderabad",
                "skillLevel", "BEGINNER",
                "availableSeats", 0,
                "totalSeats", 0,
                "description", "Already full session"
        );

        MvcResult r = mockMvc.perform(post("/opportunities")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(opp)))
                .andExpect(status().isOk())
                .andReturn();

        Long fullOppId = objectMapper.readTree(r.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        Map<String, Long> body = Map.of("opportunityId", fullOppId);
        mockMvc.perform(post("/registrations/training")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(33)
    void testGetStudentRegistrations() throws Exception {
        mockMvc.perform(get("/registrations/training/my")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    // ==========================================
    // PHASE 5: ATTENDANCE TESTS
    // ==========================================

    @Test
    @Order(40)
    void testMarkAttendance() throws Exception {
        assertThat(studentId).isNotNull();

        Map<String, Object> body = Map.of(
                "studentId", studentId,
                "opportunityId", opportunityId,
                "date", LocalDate.now().minusDays(1).toString(),
                "status", "PRESENT",
                "remarks", "Good session"
        );

        mockMvc.perform(post("/attendance")
                        .header("Authorization", "Bearer " + coachToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PRESENT"));
    }

    @Test
    @Order(41)
    void testGetStudentAttendancePercentage() throws Exception {
        mockMvc.perform(get("/attendance/student/" + studentId + "/percentage")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isNumber());
    }

    // ==========================================
    // PHASE 6: PERFORMANCE TESTS
    // ==========================================

    @Test
    @Order(50)
    void testRecordPerformance() throws Exception {
        Map<String, Object> body = Map.of(
                "studentId", studentId,
                "fitnessScore", 7.5,
                "skillScore", 8.0,
                "matchPerformance", 7.0,
                "remarks", "Good improvement",
                "evaluationDate", LocalDate.now().toString()
        );

        mockMvc.perform(post("/performance")
                        .header("Authorization", "Bearer " + coachToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.overallScore").isNumber());
    }

    @Test
    @Order(51)
    void testGetStudentPerformance() throws Exception {
        mockMvc.perform(get("/performance/student/" + studentId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    // ==========================================
    // PHASE 7: ANALYTICS TESTS
    // ==========================================

    @Test
    @Order(60)
    void testAnalyticsOverview() throws Exception {
        mockMvc.perform(get("/analytics/overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalStudents").isNumber())
                .andExpect(jsonPath("$.data.totalCoaches").isNumber())
                .andExpect(jsonPath("$.data.studentsBySkillLevel").isArray());
    }

    @Test
    @Order(61)
    void testAnalyticsReflectsRealData() throws Exception {
        long studentCount = studentRepository.count();

        MvcResult result = mockMvc.perform(get("/analytics/overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        var data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
        long reportedCount = data.get("totalStudents").asLong();
        assertEquals(studentCount, reportedCount, "Analytics must reflect actual database count");
    }

    // ==========================================
    // PHASE 8: ROLE AUTHORIZATION TESTS
    // ==========================================

    @Test
    @Order(70)
    void testStudentCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/students")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(71)
    void testUnauthenticatedAccessDenied() throws Exception {
        mockMvc.perform(get("/students/me"))
                .andExpect(status().isUnauthorized()); // no token -> 401 via AuthenticationEntryPoint
    }

    @Test
    @Order(72)
    void testAdminCanListAllStudents() throws Exception {
        mockMvc.perform(get("/students")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    // ==========================================
    // PHASE 9: COMPETITION TESTS
    // ==========================================

    @Test
    @Order(80)
    void testGetCompetitions() throws Exception {
        mockMvc.perform(get("/competitions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    // ==========================================
    // PHASE 10: CSV IMPORT / EXPORT TESTS
    // ==========================================

    @Test
    @Order(90)
    void testCsvPlayerImportUnauthenticated() throws Exception {
        String csvContent = "PlayerID,Name,Age,Position,TeamID,JerseyNumber\nP_TEST1,No Auth Player,25,Forward,T1,99\n";
        org.springframework.mock.web.MockMultipartFile csvFile =
                new org.springframework.mock.web.MockMultipartFile(
                        "file", "players.csv", "text/csv", csvContent.getBytes());
        mockMvc.perform(multipart("/csv/players/import")
                        .file(csvFile)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isUnauthorized()); // no token -> 401
    }

    @Test
    @Order(91)
    void testCsvPlayerImportAsStudentForbidden() throws Exception {
        assertThat(studentToken).isNotEmpty();
        String csvContent = "PlayerID,Name,Age,Position,TeamID,JerseyNumber\nP_TEST1,Student Attempt,25,Forward,T1,99\n";
        org.springframework.mock.web.MockMultipartFile csvFile =
                new org.springframework.mock.web.MockMultipartFile(
                        "file", "players.csv", "text/csv", csvContent.getBytes());
        mockMvc.perform(multipart("/csv/players/import")
                        .file(csvFile)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(92)
    void testCsvPlayerImportAsAdminSuccess() throws Exception {
        assertThat(adminToken).isNotEmpty();
        String csvContent = "PlayerID,Name,Age,Position,TeamID,JerseyNumber\nP_CSV01,CSV Test Player,22,Midfielder,T_CSV,7\n";
        org.springframework.mock.web.MockMultipartFile csvFile =
                new org.springframework.mock.web.MockMultipartFile(
                        "file", "players.csv", "text/csv", csvContent.getBytes());
        MvcResult result = mockMvc.perform(multipart("/csv/players/import")
                        .file(csvFile)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        var json = objectMapper.readTree(body);
        assertEquals(1, json.get("totalRows").asInt(), "totalRows should be 1");
        assertEquals(1, json.get("saved").asInt(), "saved should be 1");
        assertEquals(0, json.get("updated").asInt(), "updated should be 0");
    }

    @Test
    @Order(93)
    void testCsvPlayerImportUpdateExistingPlayer() throws Exception {
        assertThat(adminToken).isNotEmpty();
        // Re-import same PlayerID with different name -> should update, not insert
        String csvContent = "PlayerID,Name,Age,Position,TeamID,JerseyNumber\nP_CSV01,CSV Test Player UPDATED,23,Forward,T_CSV,8\n";
        org.springframework.mock.web.MockMultipartFile csvFile =
                new org.springframework.mock.web.MockMultipartFile(
                        "file", "players.csv", "text/csv", csvContent.getBytes());
        MvcResult result = mockMvc.perform(multipart("/csv/players/import")
                        .file(csvFile)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        var json = objectMapper.readTree(body);
        assertEquals(1, json.get("totalRows").asInt());
        assertEquals(0, json.get("saved").asInt(), "Player already exists - should update, not save");
        assertEquals(1, json.get("updated").asInt());
    }

    @Test
    @Order(94)
    void testCsvPlayerImportMissingRequiredField() throws Exception {
        assertThat(adminToken).isNotEmpty();
        // Name is empty — GlobalExceptionHandler maps IllegalArgumentException -> 400
        String badCsv = "PlayerID,Name,Age,Position,TeamID,JerseyNumber\nP_BAD,,25,Forward,T1,99\n";
        org.springframework.mock.web.MockMultipartFile csvFile =
                new org.springframework.mock.web.MockMultipartFile(
                        "file", "players.csv", "text/csv", badCsv.getBytes());
        mockMvc.perform(multipart("/csv/players/import")
                        .file(csvFile)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(95)
    void testCsvPlayerExportAsAdminSuccess() throws Exception {
        assertThat(adminToken).isNotEmpty();
        MvcResult result = mockMvc.perform(get("/csv/players/export")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        String contentType = result.getResponse().getContentType();
        assertThat(contentType).contains("text/csv");

        String csv = result.getResponse().getContentAsString();
        // Must have header row
        assertThat(csv).contains("PlayerID");
        assertThat(csv).contains("Name");
        // Must contain our test player
        assertThat(csv).contains("P_CSV01");
    }

    @Test
    @Order(96)
    void testCsvPlayerExportUnauthenticated() throws Exception {
        mockMvc.perform(get("/csv/players/export"))
                .andExpect(status().isUnauthorized()); // no token -> 401
    }

    @Test
    @Order(97)
    void testCsvCompetitionExportAsAdminSuccess() throws Exception {
        assertThat(adminToken).isNotEmpty();
        MvcResult result = mockMvc.perform(get("/csv/competitions/export")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        String contentType = result.getResponse().getContentType();
        assertThat(contentType).contains("text/csv");

        String csv = result.getResponse().getContentAsString();
        assertThat(csv).contains("CompetitionID");
        assertThat(csv).contains("Title");
    }

    @Test
    @Order(98)
    void testCsvResultsExportAsAdminSuccess() throws Exception {
        assertThat(adminToken).isNotEmpty();
        MvcResult result = mockMvc.perform(get("/csv/results/export")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        String contentType = result.getResponse().getContentType();
        assertThat(contentType).contains("text/csv");

        String csv = result.getResponse().getContentAsString();
        assertThat(csv).contains("RegistrationID");
        assertThat(csv).contains("CompetitionID");
    }

    @Test
    @Order(99)
    void testCsvInvalidFileTypeRejected() throws Exception {
        assertThat(adminToken).isNotEmpty();
        // Upload bytes with a .txt filename — CsvService checks extension -> IllegalArgumentException -> 400
        org.springframework.mock.web.MockMultipartFile txtFile =
                new org.springframework.mock.web.MockMultipartFile(
                        "file", "data.txt", "text/plain", "not a csv".getBytes());
        mockMvc.perform(multipart("/csv/players/import")
                        .file(txtFile)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest());
    }
}
