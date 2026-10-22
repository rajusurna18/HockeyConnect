package com.hockeyconnect.config;

import com.hockeyconnect.entity.*;
import com.hockeyconnect.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CoachRepository coachRepository;
    private final OpportunityRepository opportunityRepository;
    private final CompetitionRepository competitionRepository;
    private final TrainingRegistrationRepository trainingRegRepo;
    private final CompetitionRegistrationRepository competitionRegRepo;
    private final AttendanceRepository attendanceRepository;
    private final PerformanceRepository performanceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping...");
            return;
        }
        log.info("Seeding database with demo data...");

        // ===== CREATE ADMIN =====
        User admin = createUser("Admin User", "admin@hockeyconnect.com", "Admin@123", User.Role.ADMIN);

        // ===== CREATE COACHES =====
        User coachUser1 = createUser("Rajesh Kumar", "coach@hockeyconnect.com", "Coach@123", User.Role.COACH);
        User coachUser2 = createUser("Sunita Reddy", "sunita@hockeyconnect.com", "Coach@123", User.Role.COACH);
        User coachUser3 = createUser("Vikram Singh", "vikram@hockeyconnect.com", "Coach@123", User.Role.COACH);

        Coach coach1 = createCoach(coachUser1, "Rajesh Kumar", "Hyderabad", "SAI Hockey Academy", 12, "Field Hockey, Goalkeeping", "Former national player with 12 years coaching experience");
        Coach coach2 = createCoach(coachUser2, "Sunita Reddy", "Secunderabad", "Deccan Hockey Club", 8, "Attack, Midfield", "State-level champion, women's hockey specialist");
        Coach coach3 = createCoach(coachUser3, "Vikram Singh", "Hyderabad", "Hyderabad Sports Authority", 15, "Defense, Team Strategy", "Ex-national team defender");

        // ===== CREATE STUDENTS =====
        User[] studentUsers = {
            createUser("Arjun Sharma", "student@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Priya Patel", "priya@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Mohammed Ali", "ali@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Kavya Reddy", "kavya@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Rohan Mehta", "rohan@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Sneha Gupta", "sneha@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Aditya Verma", "aditya@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Pooja Nair", "pooja@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Karthik Iyer", "karthik@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Divya Sharma", "divya@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Ravi Teja", "ravi@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Ananya Singh", "ananya@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Suresh Babu", "suresh@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Meera Krishnan", "meera@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Nikhil Raj", "nikhil@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Tejasvi Naidu", "tejasvi@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Bhavani Devi", "bhavani@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Sai Krishna", "sai@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Lalitha Kumari", "lalitha@hockeyconnect.com", "Student@123", User.Role.STUDENT),
            createUser("Pranav Sharma", "pranav@hockeyconnect.com", "Student@123", User.Role.STUDENT)
        };

        Student[] students = {
            createStudent(studentUsers[0], "Arjun Sharma", 17, "Male", "St. Mary's School, Hyderabad", "Hyderabad", "9876543210", Student.SkillLevel.BEGINNER, 1, "Saturday,Sunday", "Morning", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[1], "Priya Patel", 19, "Female", "Osmania University, Hyderabad", "Hyderabad", "9876543211", Student.SkillLevel.INTERMEDIATE, 3, "Saturday,Wednesday", "Evening", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[2], "Mohammed Ali", 16, "Male", "Kendriya Vidyalaya, Secunderabad", "Secunderabad", "9876543212", Student.SkillLevel.BEGINNER, 0, "Saturday,Sunday", "Morning", Student.ParticipationStatus.REGISTERED),
            createStudent(studentUsers[3], "Kavya Reddy", 20, "Female", "JNTU Hyderabad", "Hyderabad", "9876543213", Student.SkillLevel.ADVANCED, 5, "Tuesday,Thursday", "Morning", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[4], "Rohan Mehta", 15, "Male", "DAV Public School, Hyderabad", "Hyderabad", "9876543214", Student.SkillLevel.BEGINNER, 1, "Saturday", "Afternoon", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[5], "Sneha Gupta", 18, "Female", "Hyderabad Public School", "Hyderabad", "9876543215", Student.SkillLevel.INTERMEDIATE, 2, "Wednesday,Saturday", "Evening", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[6], "Aditya Verma", 21, "Male", "CBIT College, Hyderabad", "Hyderabad", "9876543216", Student.SkillLevel.INTERMEDIATE, 4, "Monday,Wednesday,Friday", "Morning", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[7], "Pooja Nair", 16, "Female", "Meridian School, Hyderabad", "Hyderabad", "9876543217", Student.SkillLevel.BEGINNER, 0, "Saturday,Sunday", "Morning", Student.ParticipationStatus.REGISTERED),
            createStudent(studentUsers[8], "Karthik Iyer", 22, "Male", "OU College of Engineering", "Secunderabad", "9876543218", Student.SkillLevel.ADVANCED, 6, "Tuesday,Thursday,Saturday", "Afternoon", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[9], "Divya Sharma", 17, "Female", "Little Flower School, Hyderabad", "Hyderabad", "9876543219", Student.SkillLevel.BEGINNER, 1, "Saturday", "Morning", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[10], "Ravi Teja", 19, "Male", "MGIT College, Hyderabad", "LB Nagar, Hyderabad", "9876543220", Student.SkillLevel.INTERMEDIATE, 3, "Saturday,Sunday", "Evening", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[11], "Ananya Singh", 18, "Female", "Bhavan's School, Hyderabad", "Hyderabad", "9876543221", Student.SkillLevel.INTERMEDIATE, 2, "Wednesday,Saturday", "Morning", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[12], "Suresh Babu", 23, "Male", "JNTU Kakinada", "Secunderabad", "9876543222", Student.SkillLevel.ADVANCED, 7, "Monday,Friday", "Morning", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[13], "Meera Krishnan", 17, "Female", "KV No.1 Secunderabad", "Secunderabad", "9876543223", Student.SkillLevel.BEGINNER, 0, "Saturday", "Afternoon", Student.ParticipationStatus.REGISTERED),
            createStudent(studentUsers[14], "Nikhil Raj", 20, "Male", "Sreenidhi Institute", "Hyderabad", "9876543224", Student.SkillLevel.INTERMEDIATE, 3, "Tuesday,Thursday", "Morning", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[15], "Tejasvi Naidu", 16, "Female", "Hyderabad Central School", "Hyderabad", "9876543225", Student.SkillLevel.BEGINNER, 1, "Saturday,Sunday", "Morning", Student.ParticipationStatus.REGISTERED),
            createStudent(studentUsers[16], "Bhavani Devi", 24, "Female", "OU Arts College", "Secunderabad", "9876543226", Student.SkillLevel.ADVANCED, 8, "Monday,Wednesday,Friday", "Morning", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[17], "Sai Krishna", 19, "Male", "Vasavi College, Hyderabad", "Hyderabad", "9876543227", Student.SkillLevel.INTERMEDIATE, 4, "Saturday,Wednesday", "Evening", Student.ParticipationStatus.ACTIVE),
            createStudent(studentUsers[18], "Lalitha Kumari", 15, "Female", "Nasr School, Hyderabad", "Hyderabad", "9876543228", Student.SkillLevel.BEGINNER, 0, "Saturday", "Morning", Student.ParticipationStatus.REGISTERED),
            createStudent(studentUsers[19], "Pranav Sharma", 21, "Male", "MVSR Engineering College", "Hyderabad", "9876543229", Student.SkillLevel.ADVANCED, 5, "Tuesday,Thursday", "Morning", Student.ParticipationStatus.ACTIVE)
        };

        // ===== CREATE OPPORTUNITIES =====
        Opportunity opp1 = createOpportunity("Beginner Hockey Training - SAI Academy", Opportunity.OpportunityType.TRAINING,
                "SAI Hockey Academy", "SAI Sports Complex, Lal Bahadur Stadium, Hyderabad", coach1,
                LocalDate.now().plusDays(3), LocalTime.of(7, 0), LocalTime.of(9, 0),
                Opportunity.SkillLevel.BEGINNER, 20,
                "Comprehensive beginner hockey training covering basic skills, stick handling, and game rules. Coached by former national player Rajesh Kumar.",
                "9876543200 | rajesh@saihockey.com");

        Opportunity opp2 = createOpportunity("Intermediate Hockey Academy - Deccan Club", Opportunity.OpportunityType.ACADEMY,
                "Deccan Hockey Club", "Secunderabad Hockey Ground, Secunderabad", coach2,
                LocalDate.now().plusDays(5), LocalTime.of(6, 30), LocalTime.of(8, 30),
                Opportunity.SkillLevel.INTERMEDIATE, 15,
                "Skill development program for intermediate players. Focus on advanced stick work, positioning, and team play.",
                "9876543201 | sunita@deccan.com");

        Opportunity opp3 = createOpportunity("Advanced Training Camp - HSA", Opportunity.OpportunityType.TRAINING,
                "Hyderabad Sports Authority", "Gachibowli Hockey Stadium, Hyderabad", coach3,
                LocalDate.now().plusDays(7), LocalTime.of(5, 30), LocalTime.of(8, 0),
                Opportunity.SkillLevel.ADVANCED, 10,
                "Elite training camp for advanced players. Intensive sessions covering game strategy, fitness, and match preparation.",
                "9876543202 | vikram@hsa.com");

        Opportunity opp4 = createOpportunity("Saturday Morning Beginner Batch", Opportunity.OpportunityType.TRAINING,
                "Hyderabad Hockey Association", "Fateh Maidan, Hyderabad", coach1,
                LocalDate.now().plusDays(4), LocalTime.of(7, 0), LocalTime.of(9, 0),
                Opportunity.SkillLevel.BEGINNER, 25,
                "Weekend beginner training for school students. Perfect for those who want to start their hockey journey.",
                "9876543200");

        Opportunity opp5 = createOpportunity("St. Mary's School Hockey Team Trials", Opportunity.OpportunityType.SCHOOL_TEAM,
                "St. Mary's School", "School Hockey Ground, Hyderabad", coach1,
                LocalDate.now().plusDays(10), LocalTime.of(15, 0), LocalTime.of(17, 0),
                Opportunity.SkillLevel.BEGINNER, 30,
                "Inter-school hockey team trials open to all St. Mary's students. No prior experience required.",
                "principal@stmarys.edu.in");

        Opportunity opp6 = createOpportunity("JNTU College Team Practice", Opportunity.OpportunityType.COLLEGE_TEAM,
                "JNTU Hyderabad", "JNTU Sports Ground", coach2,
                LocalDate.now().plusDays(2), LocalTime.of(17, 0), LocalTime.of(19, 0),
                Opportunity.SkillLevel.INTERMEDIATE, 20,
                "Regular practice sessions for JNTU hockey team members. Open to all JNTU students.",
                "sports@jntu.ac.in");

        Opportunity opp7 = createOpportunity("Evening Hockey Training - All Levels", Opportunity.OpportunityType.TRAINING,
                "Hyderabad Hockey Club", "Khairatabad Hockey Ground", coach2,
                LocalDate.now().plusDays(6), LocalTime.of(17, 30), LocalTime.of(19, 30),
                Opportunity.SkillLevel.ALL, 18,
                "Evening batch for working students and professionals. All skill levels welcome.",
                "9876543205");

        Opportunity opp8 = createOpportunity("Weekend Hockey Camp - Intermediate", Opportunity.OpportunityType.TRAINING,
                "Deccan Hockey Club", "Secunderabad Sports Complex", coach3,
                LocalDate.now().plusDays(8), LocalTime.of(6, 0), LocalTime.of(9, 0),
                Opportunity.SkillLevel.INTERMEDIATE, 15,
                "Weekend intensive training for intermediate players wanting to advance their skills.",
                "9876543206");

        // ===== CREATE COMPETITIONS =====
        Competition comp1 = Competition.builder()
                .title("Hyderabad Schools Hockey Championship 2024")
                .organizer("Hyderabad Hockey Association")
                .location("Lal Bahadur Stadium, Hyderabad")
                .startDate(LocalDate.now().plusDays(20))
                .endDate(LocalDate.now().plusDays(22))
                .startTime(LocalTime.of(9, 0))
                .skillLevel(Competition.SkillLevel.ALL)
                .maxParticipants(200)
                .description("Annual inter-school hockey championship open to all Hyderabad schools. U-17 and U-19 categories.")
                .contactInfo("tournament@hha.in | 9876543300")
                .prize("Trophy + Certificates + Scholarship for winners")
                .status(Competition.Status.UPCOMING)
                .build();

        Competition comp2 = Competition.builder()
                .title("Telangana State College Hockey Tournament")
                .organizer("Telangana Sports Authority")
                .location("Gachibowli Indoor Stadium, Hyderabad")
                .startDate(LocalDate.now().plusDays(35))
                .endDate(LocalDate.now().plusDays(38))
                .startTime(LocalTime.of(8, 0))
                .skillLevel(Competition.SkillLevel.INTERMEDIATE)
                .maxParticipants(300)
                .description("State-level college hockey tournament. Teams from across Telangana will compete.")
                .contactInfo("sports@tsports.in | 9876543301")
                .prize("Cash Prize ₹50,000 + Trophy")
                .status(Competition.Status.UPCOMING)
                .build();

        Competition comp3 = Competition.builder()
                .title("SAI Hyderabad Hockey Cup 2024")
                .organizer("SAI Hyderabad")
                .location("SAI Sports Complex, Hyderabad")
                .startDate(LocalDate.now().plusDays(15))
                .endDate(LocalDate.now().plusDays(17))
                .startTime(LocalTime.of(10, 0))
                .skillLevel(Competition.SkillLevel.ADVANCED)
                .maxParticipants(150)
                .description("Elite level competition for advanced players. Pathway to state and national selection.")
                .contactInfo("sai.hyd@sports.gov.in")
                .prize("National Selection + Trophy")
                .status(Competition.Status.UPCOMING)
                .build();

        Competition comp4 = Competition.builder()
                .title("HockeyConnect Beginner League")
                .organizer("HockeyConnect")
                .location("Fateh Maidan, Hyderabad")
                .startDate(LocalDate.now().plusDays(12))
                .endDate(LocalDate.now().plusDays(14))
                .startTime(LocalTime.of(8, 0))
                .skillLevel(Competition.SkillLevel.BEGINNER)
                .maxParticipants(100)
                .description("Specially designed for beginner players to experience competitive hockey in a supportive environment.")
                .contactInfo("connect@hockeyconnect.in")
                .prize("Medals + Certificates")
                .status(Competition.Status.UPCOMING)
                .build();

        competitionRepository.saveAll(List.of(comp1, comp2, comp3, comp4));

        // ===== SEED REGISTRATIONS =====
        createTrainingReg(students[0], opp1);
        createTrainingReg(students[0], opp4);
        createTrainingReg(students[1], opp2);
        createTrainingReg(students[1], opp6);
        createTrainingReg(students[2], opp1);
        createTrainingReg(students[3], opp3);
        createTrainingReg(students[3], opp6);
        createTrainingReg(students[4], opp4);
        createTrainingReg(students[5], opp2);
        createTrainingReg(students[5], opp7);
        createTrainingReg(students[6], opp2);
        createTrainingReg(students[7], opp1);
        createTrainingReg(students[8], opp3);
        createTrainingReg(students[9], opp4);
        createTrainingReg(students[10], opp2);
        createTrainingReg(students[11], opp7);
        createTrainingReg(students[12], opp3);
        createTrainingReg(students[14], opp2);
        createTrainingReg(students[16], opp3);
        createTrainingReg(students[17], opp2);

        // Competition registrations
        createCompReg(students[0], comp4);
        createCompReg(students[1], comp1);
        createCompReg(students[3], comp3);
        createCompReg(students[4], comp4);
        createCompReg(students[6], comp1);
        createCompReg(students[8], comp3);
        createCompReg(students[9], comp4);
        createCompReg(students[12], comp2);
        createCompReg(students[16], comp3);
        createCompReg(students[19], comp2);

        // ===== SEED ATTENDANCE =====
        LocalDate pastDate1 = LocalDate.now().minusDays(7);
        LocalDate pastDate2 = LocalDate.now().minusDays(14);

        markAttendance(students[0], opp1, pastDate1, Attendance.AttendanceStatus.PRESENT, coach1);
        markAttendance(students[0], opp1, pastDate2, Attendance.AttendanceStatus.PRESENT, coach1);
        markAttendance(students[0], opp4, pastDate1, Attendance.AttendanceStatus.PRESENT, coach1);
        markAttendance(students[1], opp2, pastDate1, Attendance.AttendanceStatus.PRESENT, coach2);
        markAttendance(students[1], opp2, pastDate2, Attendance.AttendanceStatus.ABSENT, coach2);
        markAttendance(students[2], opp1, pastDate1, Attendance.AttendanceStatus.PRESENT, coach1);
        markAttendance(students[3], opp3, pastDate1, Attendance.AttendanceStatus.PRESENT, coach3);
        markAttendance(students[4], opp4, pastDate2, Attendance.AttendanceStatus.PRESENT, coach1);
        markAttendance(students[5], opp2, pastDate1, Attendance.AttendanceStatus.PRESENT, coach2);
        markAttendance(students[6], opp2, pastDate1, Attendance.AttendanceStatus.LATE, coach2);
        markAttendance(students[8], opp3, pastDate1, Attendance.AttendanceStatus.PRESENT, coach3);
        markAttendance(students[12], opp3, pastDate2, Attendance.AttendanceStatus.PRESENT, coach3);

        // ===== SEED PERFORMANCE =====
        recordPerformance(students[0], coach1, opp1, pastDate1, 6.5, 7.0, 6.0, "Good progress, needs to work on stick handling");
        recordPerformance(students[1], coach2, opp2, pastDate1, 7.5, 8.0, 7.0, "Excellent team player, improving in attack");
        recordPerformance(students[3], coach3, opp3, pastDate1, 8.5, 9.0, 8.5, "Outstanding performance, ready for competition");
        recordPerformance(students[6], coach2, opp2, pastDate1, 7.0, 7.5, 6.5, "Consistent performer, keep up the training");
        recordPerformance(students[8], coach3, opp3, pastDate2, 9.0, 8.5, 9.0, "Elite level - recommend for state team trials");
        recordPerformance(students[0], coach1, opp1, pastDate2, 6.0, 6.5, 5.5, "Beginner stage, showing good enthusiasm");
        recordPerformance(students[12], coach3, opp3, pastDate2, 8.0, 8.5, 7.5, "Strong defense skills, natural leader");

        log.info("✅ Database seeded successfully!");
        log.info("👤 Demo Accounts:");
        log.info("   Admin:   admin@hockeyconnect.com / Admin@123");
        log.info("   Coach:   coach@hockeyconnect.com / Coach@123");
        log.info("   Student: student@hockeyconnect.com / Student@123");
    }

    // ==================
    // HELPER METHODS
    // ==================

    private User createUser(String name, String email, String password, User.Role role) {
        return userRepository.save(User.builder()
                .name(name).email(email)
                .password(passwordEncoder.encode(password))
                .role(role).build());
    }

    private Coach createCoach(User user, String name, String location, String institution,
                               int exp, String certs, String bio) {
        return coachRepository.save(Coach.builder()
                .user(user).fullName(name).location(location)
                .institution(institution).experienceYears(exp)
                .certifications(certs).bio(bio).build());
    }

    private Student createStudent(User user, String name, int age, String gender,
                                   String institution, String location, String phone,
                                   Student.SkillLevel skill, int exp, String days, String time,
                                   Student.ParticipationStatus status) {
        return studentRepository.save(Student.builder()
                .user(user).fullName(name).age(age).gender(gender)
                .institution(institution).location(location).phone(phone)
                .skillLevel(skill).experienceYears(exp)
                .preferredDays(days).preferredTime(time)
                .participationStatus(status).build());
    }

    private Opportunity createOpportunity(String title, Opportunity.OpportunityType type,
                                           String organizer, String location, Coach coach,
                                           LocalDate date, LocalTime start, LocalTime end,
                                           Opportunity.SkillLevel skill, int seats,
                                           String desc, String contact) {
        return opportunityRepository.save(Opportunity.builder()
                .title(title).type(type).organizer(organizer)
                .location(location).coach(coach).date(date)
                .startTime(start).endTime(end).skillLevel(skill)
                .availableSeats(seats).totalSeats(seats)
                .description(desc).contactInfo(contact)
                .status(Opportunity.Status.ACTIVE).build());
    }

    private void createTrainingReg(Student student, Opportunity opp) {
        if (!trainingRegRepo.existsByStudentIdAndOpportunityId(student.getId(), opp.getId())) {
            trainingRegRepo.save(TrainingRegistration.builder()
                    .student(student).opportunity(opp)
                    .status(TrainingRegistration.Status.CONFIRMED).build());
            if (opp.getAvailableSeats() > 0) {
                opp.setAvailableSeats(opp.getAvailableSeats() - 1);
                opportunityRepository.save(opp);
            }
        }
    }

    private void createCompReg(Student student, Competition comp) {
        if (!competitionRegRepo.existsByStudentIdAndCompetitionId(student.getId(), comp.getId())) {
            competitionRegRepo.save(CompetitionRegistration.builder()
                    .student(student).competition(comp)
                    .status(CompetitionRegistration.Status.REGISTERED).build());
        }
    }

    private void markAttendance(Student student, Opportunity opp, LocalDate date,
                                 Attendance.AttendanceStatus status, Coach coach) {
        attendanceRepository.save(Attendance.builder()
                .student(student).opportunity(opp).date(date)
                .status(status).markedBy(coach).build());
    }

    private void recordPerformance(Student student, Coach coach, Opportunity opp,
                                    LocalDate date, double fitness, double skill, double match, String remarks) {
        double overall = (fitness + skill + match) / 3.0;
        performanceRepository.save(Performance.builder()
                .student(student).coach(coach).opportunity(opp)
                .evaluationDate(date).fitnessScore(fitness)
                .skillScore(skill).matchPerformance(match)
                .overallScore(Math.round(overall * 10.0) / 10.0)
                .remarks(remarks).build());
    }
}
