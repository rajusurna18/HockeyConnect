package com.hockeyconnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "opportunities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Opportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OpportunityType type;

    private String organizer;
    private String location;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    private SkillLevel skillLevel;

    @Builder.Default
    private Integer availableSeats = 20;

    @Builder.Default
    private Integer totalSeats = 20;

    @Column(length = 1000)
    private String description;

    private String contactInfo;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coach_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Coach coach;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum OpportunityType {
        TRAINING, ACADEMY, SCHOOL_TEAM, COLLEGE_TEAM, COMPETITION, TOURNAMENT
    }

    public enum SkillLevel {
        BEGINNER, INTERMEDIATE, ADVANCED, ALL
    }

    public enum Status {
        ACTIVE, INACTIVE, COMPLETED, CANCELLED
    }
}
