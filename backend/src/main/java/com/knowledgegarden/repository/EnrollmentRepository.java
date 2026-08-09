package com.knowledgegarden.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegarden.entity.Course;
import com.knowledgegarden.entity.Enrollment;
import com.knowledgegarden.entity.User;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment>findByUserId(Long userId);
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
}
