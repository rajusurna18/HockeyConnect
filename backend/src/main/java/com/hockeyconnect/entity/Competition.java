package com.hockeyconnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "competitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String organizer;
    private String location;

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;

    @Enumerated(EnumType.STRING)
    private SkillLevel skillLevel;

    @Builder.Default
    private Integer maxParticipants = 100;

    @Column(length = 1000)
    private String description;

    private String contactInfo;
    private String prize;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.UPCOMING;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum SkillLevel {
        BEGINNER, INTERMEDIATE, ADVANCED, ALL
    }

    public enum Status {
        UPCOMING, ONGOING, COMPLETED, CANCELLED
    }
}
