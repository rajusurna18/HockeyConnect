package com.hockeyconnect.repository;

import com.hockeyconnect.entity.Opportunity;
import com.hockeyconnect.entity.Opportunity.OpportunityType;
import com.hockeyconnect.entity.Opportunity.SkillLevel;
import com.hockeyconnect.entity.Opportunity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    List<Opportunity> findByStatus(Status status);
    List<Opportunity> findByType(OpportunityType type);
    List<Opportunity> findBySkillLevel(SkillLevel skillLevel);
    List<Opportunity> findByLocation(String location);
    List<Opportunity> findByCoachId(Long coachId);

    @Query("SELECT o FROM Opportunity o WHERE " +
           "(:type IS NULL OR o.type = :type) AND " +
           "(:skillLevel IS NULL OR o.skillLevel = :skillLevel OR o.skillLevel = 'ALL') AND " +
           "(:location IS NULL OR LOWER(o.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "o.status = 'ACTIVE'")
    List<Opportunity> searchOpportunities(
        @Param("type") OpportunityType type,
        @Param("skillLevel") SkillLevel skillLevel,
        @Param("location") String location
    );

    @Query("SELECT o.type, COUNT(o) FROM Opportunity o GROUP BY o.type")
    List<Object[]> countByType();
}
