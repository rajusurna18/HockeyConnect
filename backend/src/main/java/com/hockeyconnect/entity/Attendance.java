package com.hockeyconnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "opportunity_id", "date"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "opportunity_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "coach"})
    private Opportunity opportunity;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    private String remarks;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "marked_by_coach_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Coach markedBy;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum AttendanceStatus {
        PRESENT, ABSENT, LATE
    }
}
