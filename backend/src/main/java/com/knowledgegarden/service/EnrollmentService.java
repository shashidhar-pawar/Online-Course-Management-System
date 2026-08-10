package com.knowledgegarden.service;

import java.util.List;

import com.knowledgegarden.dto.EnrolledCourseResponse;


public interface EnrollmentService {
	
	void enroll(Long userId, Long courseId);
	List<EnrolledCourseResponse>getMyCourses(Long userId);
	
}