package com.hockeyconnect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "competition_registrations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "competition_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompetitionRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "competition_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Competition competition;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.REGISTERED;

    private String result;
    private Integer rank;

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
        REGISTERED, CONFIRMED, PARTICIPATED, WITHDRAWN
    }
}
