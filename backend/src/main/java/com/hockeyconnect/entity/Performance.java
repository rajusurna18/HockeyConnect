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
@Table(name = "performance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Performance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "opportunity_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "coach"})
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coach_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Coach coach;

    private LocalDate evaluationDate;

    private Double fitnessScore;
    private Double skillScore;
    private Double matchPerformance;
    private Double overallScore;

    @Column(length = 500)
    private String remarks;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
