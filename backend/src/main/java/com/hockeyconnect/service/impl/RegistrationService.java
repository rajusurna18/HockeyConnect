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
public class RegistrationService {

    private final TrainingRegistrationRepository trainingRegRepo;
    private final CompetitionRegistrationRepository competitionRegRepo;
    private final StudentRepository studentRepository;
    private final OpportunityRepository opportunityRepository;
    private final CompetitionRepository competitionRepository;

    @Transactional
    public TrainingRegistration registerForTraining(Long studentId, Long opportunityId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity", opportunityId));

        if (trainingRegRepo.existsByStudentIdAndOpportunityId(studentId, opportunityId)) {
            throw new DuplicateRegistrationException("Student is already registered for this training");
        }

        if (opportunity.getAvailableSeats() != null && opportunity.getAvailableSeats() <= 0) {
            throw new InsufficientCapacityException("No available seats for this opportunity");
        }

        // Reduce available seats
        if (opportunity.getAvailableSeats() != null) {
            opportunity.setAvailableSeats(opportunity.getAvailableSeats() - 1);
            opportunityRepository.save(opportunity);
        }

        // Update student status to ACTIVE
        student.setParticipationStatus(Student.ParticipationStatus.ACTIVE);
        studentRepository.save(student);

        TrainingRegistration reg = TrainingRegistration.builder()
                .student(student)
                .opportunity(opportunity)
                .status(TrainingRegistration.Status.CONFIRMED)
                .build();

        return trainingRegRepo.save(reg);
    }

    public List<TrainingRegistration> getStudentTrainings(Long studentId) {
        return trainingRegRepo.findByStudentId(studentId);
    }

    public List<TrainingRegistration> getOpportunityRegistrations(Long opportunityId) {
        return trainingRegRepo.findByOpportunityId(opportunityId);
    }

    @Transactional
    public CompetitionRegistration registerForCompetition(Long studentId, Long competitionId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));

        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Competition", competitionId));

        if (competitionRegRepo.existsByStudentIdAndCompetitionId(studentId, competitionId)) {
            throw new DuplicateRegistrationException("Student is already registered for this competition");
        }

        CompetitionRegistration reg = CompetitionRegistration.builder()
                .student(student)
                .competition(competition)
                .status(CompetitionRegistration.Status.REGISTERED)
                .build();

        return competitionRegRepo.save(reg);
    }

    public List<CompetitionRegistration> getStudentCompetitions(Long studentId) {
        return competitionRegRepo.findByStudentId(studentId);
    }

    public List<CompetitionRegistration> getCompetitionRegistrations(Long competitionId) {
        return competitionRegRepo.findByCompetitionId(competitionId);
    }

    @Transactional
    public CompetitionRegistration updateCompetitionResult(Long regId, String result, Integer rank) {
        CompetitionRegistration reg = competitionRegRepo.findById(regId)
                .orElseThrow(() -> new ResourceNotFoundException("CompetitionRegistration", regId));
        reg.setResult(result);
        reg.setRank(rank);
        reg.setStatus(CompetitionRegistration.Status.PARTICIPATED);
        return competitionRegRepo.save(reg);
    }
}
