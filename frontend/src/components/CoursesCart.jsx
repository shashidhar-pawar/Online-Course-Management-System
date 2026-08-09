import { Link } from "react-router-dom";

function CoursesCart({ course }) {
  const courseId = course.id ?? course.courseId;
  const imgUrl = course.image || `https://picsum.photos/seed/${courseId}/300/180`;

  return (
    <article className="course-card">
      <img src={imgUrl} className="course-image" alt={course.title || course.name} />
      <div className="course-card-body">
        <h3>{course.title || course.name}</h3>
        <p>{course.instructorName || course.author || "Instructor"}</p>
        <p>Rating: {course.rating || "4.5"}</p>
        <p>Rs. {course.price}</p>
        {courseId ? (
          <Link to={`/course/${courseId}`} className="course-link">
            View Details
          </Link>
        ) : (
          <span className="course-link disabled">Unavailable</span>
        )}
      </div>
    </article>
  );
}

export default CoursesCart;