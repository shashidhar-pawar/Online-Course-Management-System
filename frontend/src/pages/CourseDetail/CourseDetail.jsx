import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getCourseDetail } from "../../services/courseService";
import { enrollInCourse, getMyCourses } from "../../services/enrollmentService";

import "./CourseDetail.css";

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? "star" : "star empty"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function AccordionItem({ lesson, isOpen, onToggle }) {
  return (
    <div className="accordion-item">
      <button
        className={`accordion-header ${isOpen ? "open" : ""}`}
        onClick={onToggle}
      >
        <div className="accordion-left">
          <span className={`accordion-arrow ${isOpen ? "rotated" : ""}`}>▸</span>
          {lesson.title}
        </div>
        <div className="accordion-right">1 lecture</div>
      </button>
      {isOpen && (
        <div className="accordion-body">
          <span>📹</span>
          <span>{lesson.description}</span>
        </div>
      )}
    </div>
  );
}

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [allOpen, setAllOpen] = useState(false);
  const [purchaseNow, setPurchaseNow] = useState(false);

  useEffect(() => {
    if (!id) return;

    getCourseDetail(id)
      .then((data) => setCourse(data))
      .catch((error) => console.log("Error fetching course:", error));

    const token = localStorage.getItem("token");
    if (token) {
      getMyCourses()
        .then((myCourses) => {
          const alreadyEnrolled = myCourses.some(
            (c) => String(c.courseId) === String(id)
          );
          setPurchaseNow(alreadyEnrolled);
        })
        .catch((err) => console.error("Error checking enrollment:", err));
    }
  }, [id]);

  if (!id) {
    return (
      <>
        <Navbar />
        <h2 style={{ padding: "30px" }}>Course not found.</h2>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <h2 style={{ padding: "30px" }}>Loading course...</h2>
      </>
    );
  }

  const handleToggleAll = () => {
    setAllOpen(!allOpen);
    setOpenSection(null);
  };

  const handleSectionToggle = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const handlePurchaseNow = async () => {
    if (purchaseNow) {
      navigate(`/course/player/${id}`);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await enrollInCourse(id);
      setPurchaseNow(true);
      navigate(`/course/player/${id}`);
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate("/login");
      } else if (err.response && err.response.data) {
        window.alert(err.response.data);
      } else {
        window.alert("Enrollment failed. Please try again.");
      }
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="course-detail-page">
        <div className="course-hero">
          <div className="course-breadcrumb">
            <a>Home</a>
            <span>/</span>
            <a>Learning</a>
            <span>/</span>
            <span className="active">Web Development</span>
          </div>
          <div className="course-hero-inner">
            <div className="course-hero-left">
              <h1>{course.title}</h1>
              <p className="course-description">{course.description}</p>
              <div className="course-rating-row">
                <span className="rating-number">4.5</span>
                <StarRating rating={4.5} />
                <span className="rating-meta">(2 reviews) · Students enrolled</span>
              </div>
              <div className="course-meta">
                <p>
                  Created By{" "}
                  <span className="instructor-link">KnowledgeGarden Team</span>
                </p>
                <p>🌐 English</p>
              </div>
            </div>
            <div className="pricing-card">
              <div className="pricing-thumbnail">
                <span>⚡</span>
                <span>🟢</span>
              </div>
              <div className="pricing-body">
                <p className="price">Rs. 499</p>
                <button
                  className={`btn-cart ${purchaseNow ? "added" : ""}`}
                  onClick={handlePurchaseNow}
                >
                  {purchaseNow ? "Go to Course" : "Purchase Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="course-body">
          <div className="learn-section">
            <h2>What you'll learn</h2>
            <p>Learn {course.title} with practical examples.</p>
          </div>
          <div className="content-section">
            <h2>Course Content</h2>
            <div className="content-meta-row">
              <span>{course.lessons.length} lecture(s)</span>
              <button className="btn-toggle-all" onClick={handleToggleAll}>
                {allOpen ? "Collapse all sections" : "Expand all sections"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseDetail;