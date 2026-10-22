package com.hockeyconnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @Column(nullable = false)
    private String fullName;

    private Integer age;
    private String gender;
    private String institution;
    private String location;
    private String phone;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SkillLevel skillLevel = SkillLevel.BEGINNER;

    private Integer experienceYears;
    private String preferredDays;     // comma-separated e.g. "Monday,Wednesday"
    private String preferredTime;     // e.g. "Morning", "Evening"

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ParticipationStatus participationStatus = ParticipationStatus.REGISTERED;

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
        BEGINNER, INTERMEDIATE, ADVANCED
    }

    public enum ParticipationStatus {
        REGISTERED, ACTIVE, INACTIVE
    }
}
