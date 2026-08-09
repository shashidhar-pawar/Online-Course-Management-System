package com.knowledgegarden.serviceImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.knowledgegarden.entity.Course;
import com.knowledgegarden.entity.Enrollment;
import com.knowledgegarden.entity.User;
import com.knowledgegarden.repository.CourseRepository;
import com.knowledgegarden.repository.EnrollmentRepository;
import com.knowledgegarden.service.EnrollmentService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import com.knowledgegarden.repository.UserRepository;
import java.util.stream.Collectors;

import com.knowledgegarden.dto.EnrolledCourseResponse;
@Service
@Transactional
public class EnrollmentServiceImpl implements EnrollmentService {

	
	private final UserRepository userRepository;
	private final CourseRepository courseRepository;
	private final EnrollmentRepository enrollmentRepository;
	
	public EnrollmentServiceImpl(
	        CourseRepository courseRepository,
	        UserRepository userRepository,
	        EnrollmentRepository enrollmentRepository) {

	    this.enrollmentRepository = enrollmentRepository;
	    this.courseRepository = courseRepository;
	    this.userRepository = userRepository;
	}

	@Override
	public void enroll(Long userId, Long courseId) {
		// TODO Auto-generated method stub
		if(enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
			throw new IllegalStateException("Already enrolled in this course!");
		}
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not Found!"));
		Course course = courseRepository.findById(courseId)
				.orElseThrow(() -> new IllegalArgumentException("Course not found!"));
		
		enrollmentRepository.save(new Enrollment(user, course));
	}

	@Override
	public List<EnrolledCourseResponse> getMyCourses(Long userId) {
		// TODO Auto-generated method stub
		return enrollmentRepository.findByUserId(userId)
				.stream()
				.map(enrollment -> new EnrolledCourseResponse(
						enrollment.getCourse().getId(),
						enrollment.getCourse().getTitle(),
						enrollment.getCourse().getDescription(),
						enrollment.getCourse().getPrice(),
						enrollment.getCourse().getInstructor() !=null
									? enrollment.getCourse().getInstructor().getName() : null,
											enrollment.getEnrolledAt()
						))
				.collect(Collectors.toList());
	}
}
