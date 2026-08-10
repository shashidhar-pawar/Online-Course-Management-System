package com.knowledgegarden.controller;

import com.knowledgegarden.serviceImpl.EnrollmentServiceImpl;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.knowledgegarden.dto.EnrolledCourseResponse;
import com.knowledgegarden.service.EnrollmentService;
import com.knowledgegarden.util.CustomUserDetailsImpl;
import jakarta.transaction.Transactional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/enrollments")
@Transactional
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService, EnrollmentServiceImpl enrollmentServiceImpl) {
        this.enrollmentService = enrollmentService;
    }


    @PostMapping("/{courseId}")
    public ResponseEntity<String> enroll(@PathVariable Long courseId, @AuthenticationPrincipal CustomUserDetailsImpl userDetails){
    	enrollmentService.enroll(userDetails.getUserId(), courseId);
    	return ResponseEntity.ok("Enrolled Successfull!");
    }
    
    @GetMapping("/my-courses")
    public  ResponseEntity<List<EnrolledCourseResponse>> getMyCourses(
    		@AuthenticationPrincipal CustomUserDetailsImpl userDetails){
    	return ResponseEntity.ok(enrollmentService.getMyCourses(userDetails.getUserId()));
    }

}