package com.hockeyconnect.service.impl;

import com.hockeyconnect.entity.*;
import com.hockeyconnect.exception.*;
import com.hockeyconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final TrainingRegistrationRepository registrationRepository;

    public List<Opportunity> getAllOpportunities() {
        return opportunityRepository.findAll();
    }

    public List<Opportunity> getActiveOpportunities() {
        return opportunityRepository.findByStatus(Opportunity.Status.ACTIVE);
    }

    public Opportunity getOpportunityById(Long id) {
        return opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity", id));
    }

    public List<Opportunity> searchOpportunities(String type, String skillLevel, String location) {
        Opportunity.OpportunityType typeEnum = null;
        Opportunity.SkillLevel skillEnum = null;
        if (type != null && !type.isBlank()) {
            typeEnum = Opportunity.OpportunityType.valueOf(type.toUpperCase());
        }
        if (skillLevel != null && !skillLevel.isBlank()) {
            skillEnum = Opportunity.SkillLevel.valueOf(skillLevel.toUpperCase());
        }
        return opportunityRepository.searchOpportunities(typeEnum, skillEnum, location);
    }

    @Transactional
    public Opportunity createOpportunity(Opportunity opportunity) {
        return opportunityRepository.save(opportunity);
    }

    @Transactional
    public Opportunity updateOpportunity(Long id, Opportunity data) {
        Opportunity opp = getOpportunityById(id);
        if (data.getTitle() != null) opp.setTitle(data.getTitle());
        if (data.getType() != null) opp.setType(data.getType());
        if (data.getOrganizer() != null) opp.setOrganizer(data.getOrganizer());
        if (data.getLocation() != null) opp.setLocation(data.getLocation());
        if (data.getDate() != null) opp.setDate(data.getDate());
        if (data.getStartTime() != null) opp.setStartTime(data.getStartTime());
        if (data.getEndTime() != null) opp.setEndTime(data.getEndTime());
        if (data.getSkillLevel() != null) opp.setSkillLevel(data.getSkillLevel());
        if (data.getAvailableSeats() != null) opp.setAvailableSeats(data.getAvailableSeats());
        if (data.getDescription() != null) opp.setDescription(data.getDescription());
        if (data.getContactInfo() != null) opp.setContactInfo(data.getContactInfo());
        if (data.getStatus() != null) opp.setStatus(data.getStatus());
        return opportunityRepository.save(opp);
    }

    @Transactional
    public void deleteOpportunity(Long id) {
        if (!opportunityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Opportunity", id);
        }
        opportunityRepository.deleteById(id);
    }

    public List<Opportunity> getOpportunitiesByCoach(Long coachId) {
        return opportunityRepository.findByCoachId(coachId);
    }
}
