package com.hockeyconnect.service.impl;

import com.hockeyconnect.entity.*;
import com.hockeyconnect.exception.ResourceNotFoundException;
import com.hockeyconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));
    }

    public Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));
    }

    @Transactional
    public Student createOrUpdateProfile(Long userId, Student studentData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Student student = studentRepository.findByUserId(userId).orElse(new Student());
        student.setUser(user);
        student.setFullName(studentData.getFullName() != null ? studentData.getFullName() : user.getName());
        student.setAge(studentData.getAge());
        student.setGender(studentData.getGender());
        student.setInstitution(studentData.getInstitution());
        student.setLocation(studentData.getLocation());
        student.setPhone(studentData.getPhone());
        student.setSkillLevel(studentData.getSkillLevel() != null ? studentData.getSkillLevel() : Student.SkillLevel.BEGINNER);
        student.setExperienceYears(studentData.getExperienceYears());
        student.setPreferredDays(studentData.getPreferredDays());
        student.setPreferredTime(studentData.getPreferredTime());
        if (studentData.getParticipationStatus() != null) {
            student.setParticipationStatus(studentData.getParticipationStatus());
        }
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(Long id, Student studentData) {
        Student student = getStudentById(id);
        if (studentData.getFullName() != null) student.setFullName(studentData.getFullName());
        if (studentData.getAge() != null) student.setAge(studentData.getAge());
        if (studentData.getGender() != null) student.setGender(studentData.getGender());
        if (studentData.getInstitution() != null) student.setInstitution(studentData.getInstitution());
        if (studentData.getLocation() != null) student.setLocation(studentData.getLocation());
        if (studentData.getPhone() != null) student.setPhone(studentData.getPhone());
        if (studentData.getSkillLevel() != null) student.setSkillLevel(studentData.getSkillLevel());
        if (studentData.getExperienceYears() != null) student.setExperienceYears(studentData.getExperienceYears());
        if (studentData.getPreferredDays() != null) student.setPreferredDays(studentData.getPreferredDays());
        if (studentData.getPreferredTime() != null) student.setPreferredTime(studentData.getPreferredTime());
        if (studentData.getParticipationStatus() != null) student.setParticipationStatus(studentData.getParticipationStatus());
        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student", id);
        }
        studentRepository.deleteById(id);
    }

    // Analytics
    public Map<String, Long> getSkillDistribution() {
        Map<String, Long> dist = new LinkedHashMap<>();
        dist.put("BEGINNER", studentRepository.countBySkillLevel(Student.SkillLevel.BEGINNER));
        dist.put("INTERMEDIATE", studentRepository.countBySkillLevel(Student.SkillLevel.INTERMEDIATE));
        dist.put("ADVANCED", studentRepository.countBySkillLevel(Student.SkillLevel.ADVANCED));
        return dist;
    }
}
