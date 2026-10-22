package com.hockeyconnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_registrations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "opportunity_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingRegistration {

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

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.CONFIRMED;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime registeredAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Status {
        PENDING, CONFIRMED, CANCELLED
    }
}
