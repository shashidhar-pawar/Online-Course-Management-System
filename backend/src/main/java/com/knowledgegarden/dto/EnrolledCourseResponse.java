package com.knowledgegarden.dto;

import java.time.LocalDateTime;

public class EnrolledCourseResponse {

    
    private Long courseId;
    private String title;
    private String description;
    private Double price;
    private String instructorName;
    private LocalDateTime enrolledAt;
        
    public EnrolledCourseResponse() {
    }

	public EnrolledCourseResponse(Long courseId, String title, String description, Double price, String instructorName, LocalDateTime enrolledAt) {
		this.courseId = courseId;
		this.title = title;
		this.description = description;
		this.price = price;
		this.instructorName = instructorName;
		this.enrolledAt = enrolledAt;
	}

	public Long getCourseId() {
		return courseId;
	}

	public String getTitle() {
		return title;
	}

	public String getDescription() {
		return description;
	}

	public Double getPrice() {
		return price;
	}

	public String getInstructorName() {
		return instructorName;
	}
	public LocalDateTime getEnrolledAt() {
		return enrolledAt;
	}

}