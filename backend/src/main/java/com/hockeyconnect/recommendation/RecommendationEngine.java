package com.hockeyconnect.recommendation;

import com.hockeyconnect.entity.Opportunity;
import com.hockeyconnect.entity.Student;
import com.hockeyconnect.repository.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Smart Opportunity Recommendation Engine (Rule-Based)
 * PSE Module 4 - HockeyConnect Platform
 *
 * Recommendation logic considers:
 * - Student location (exact match → partial match)
 * - Skill level compatibility (exact → ALL level)
 * - Preferred training days
 * - Preferred time
 * - Opportunity status (ACTIVE only)
 *
 * Designed to be replaced/extended with ML model in future.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RecommendationEngine {

    private final OpportunityRepository opportunityRepository;

    public List<Opportunity> recommend(Student student, int maxResults) {
        List<Opportunity> all = opportunityRepository.findByStatus(Opportunity.Status.ACTIVE);

        Map<Opportunity, Integer> scored = new HashMap<>();

        for (Opportunity opp : all) {
            int score = 0;

            // 1. Location match (max 40 pts)
            if (student.getLocation() != null && opp.getLocation() != null) {
                String studentLoc = student.getLocation().toLowerCase();
                String oppLoc = opp.getLocation().toLowerCase();
                if (oppLoc.equals(studentLoc)) {
                    score += 40;
                } else if (oppLoc.contains(studentLoc) || studentLoc.contains(oppLoc)) {
                    score += 20;
                } else if (containsCommonWord(studentLoc, oppLoc)) {
                    score += 10;
                }
            }

            // 2. Skill level match (max 30 pts)
            if (student.getSkillLevel() != null && opp.getSkillLevel() != null) {
                String studentSkill = student.getSkillLevel().name();
                String oppSkill = opp.getSkillLevel().name();
                if (oppSkill.equals("ALL")) {
                    score += 20;
                } else if (oppSkill.equals(studentSkill)) {
                    score += 30;
                }
            }

            // 3. Preferred day match (max 20 pts)
            if (student.getPreferredDays() != null && opp.getDate() != null) {
                String dayOfWeek = opp.getDate().getDayOfWeek().name();
                String preferredDays = student.getPreferredDays().toUpperCase();
                if (preferredDays.contains(dayOfWeek.substring(0, 3)) ||
                    preferredDays.contains(dayOfWeek)) {
                    score += 20;
                }
            }

            // 4. Preferred time match (max 10 pts)
            if (student.getPreferredTime() != null && opp.getStartTime() != null) {
                int hour = opp.getStartTime().getHour();
                String pref = student.getPreferredTime().toLowerCase();
                if (pref.contains("morning") && hour >= 5 && hour < 12) score += 10;
                else if (pref.contains("afternoon") && hour >= 12 && hour < 17) score += 10;
                else if (pref.contains("evening") && hour >= 17 && hour < 21) score += 10;
            }

            // Only include if some match
            if (score > 0) {
                scored.put(opp, score);
            }
        }

        // Sort by score descending, take top N
        return scored.entrySet().stream()
                .sorted(Map.Entry.<Opportunity, Integer>comparingByValue().reversed())
                .limit(maxResults)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private boolean containsCommonWord(String a, String b) {
        Set<String> wordsA = new HashSet<>(Arrays.asList(a.split("\\s+")));
        Set<String> wordsB = new HashSet<>(Arrays.asList(b.split("\\s+")));
        return wordsA.stream().anyMatch(w -> w.length() > 3 && wordsB.contains(w));
    }
}
