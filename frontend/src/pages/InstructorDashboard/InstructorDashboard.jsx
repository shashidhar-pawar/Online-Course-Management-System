import { useCallback, useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

import Navbar from "../../components/Navbar";
import "./InstructorDashboard.css";

function getTokenClaims() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const instructorName = sessionStorage.getItem("userEmail") || "Instructor";

  const getCourses = useCallback(async (instructorId) => {
    const response = await apiClient.get(`/courses/instructor/${instructorId}`);
    return response.data;
  }, []);

  useEffect(() => {
    let active = true;

    const loadCourses = async () => {
      const claims = getTokenClaims();

      if (!claims?.user_id) return;

      try {
        const data = await getCourses(claims.user_id);
        if (active) setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    loadCourses();

    return () => {
      active = false;
    };
  }, [getCourses]);

  const handleDelete = async (courseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await apiClient.delete(`/courses/${courseId}`);

      alert("Course deleted successfully.");

      const claims = getTokenClaims();
      if (claims?.user_id) {
        const data = await getCourses(claims.user_id);
        setCourses(data);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-page">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <div>
              <h1>Welcome back, {instructorName}</h1>
              <p className="subtitle">
                Here&apos;s how your courses are performing
              </p>
            </div>

            <Link to="/upload">
              <button className="add-course-btn">
                <FaPlus /> Add New Course
              </button>
            </Link>
          </div>

          <div className="section">
            <p className="section-title">My Courses</p>

            <div className="table-card">
              <table className="courses-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Students</th>
                   
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-row">
                        No courses added yet
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course.id}>
                        <td>{course.title}</td>

                        <td>{course.studentsEnrolled}</td>

                        <td>{course.rating}</td>

                        <td>₹ {course.price}</td>

                        <td className="actions">
                          <Link to={`/editcourse/${course.id}`}>
                            <FaEdit className="icon icon-edit" />
                          </Link>

                          <FaTrash
                            className="icon icon-delete"
                            onClick={() => handleDelete(course.id)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default InstructorDashboard;
