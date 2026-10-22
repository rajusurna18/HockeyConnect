package com.hockeyconnect.repository;

import com.hockeyconnect.entity.TrainingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TrainingRegistrationRepository extends JpaRepository<TrainingRegistration, Long> {
    List<TrainingRegistration> findByStudentId(Long studentId);
    List<TrainingRegistration> findByOpportunityId(Long opportunityId);
    boolean existsByStudentIdAndOpportunityId(Long studentId, Long opportunityId);
    Optional<TrainingRegistration> findByStudentIdAndOpportunityId(Long studentId, Long opportunityId);

    long countByOpportunityId(Long opportunityId);

    @Query("SELECT FUNCTION('MONTH', r.registeredAt), COUNT(r) FROM TrainingRegistration r " +
           "WHERE FUNCTION('YEAR', r.registeredAt) = :year " +
           "GROUP BY FUNCTION('MONTH', r.registeredAt) ORDER BY FUNCTION('MONTH', r.registeredAt)")
    List<Object[]> countMonthlyRegistrations(@Param("year") int year);

    @Query("SELECT COUNT(DISTINCT r.student.id) FROM TrainingRegistration r WHERE r.opportunity.id = :opportunityId")
    long countDistinctStudentsByOpportunityId(@Param("opportunityId") Long opportunityId);
}
