package com.knowledgegarden.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(
		name = "enrollment",
		uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "courseId"})
		)
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseId", nullable = false)
    private Course course;
    
    private LocalDateTime enrolledAt;
    
    public Enrollment() {
    }

    public Enrollment(User user, Course course) {
		this.user = user;
		this.course = course;
		this.enrolledAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}


	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Course getCourse() {
		return course;
	}

	public void setCourse(Course course) {
		this.course = course;
	}

	public LocalDateTime getEnrolledAt() {
		return enrolledAt;
	}

	public void setEnrolledAt(LocalDateTime enrolledAt) {
		this.enrolledAt = enrolledAt;
	}
}