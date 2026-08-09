import { useEffect, useState } from "react";
import CoursesCart from "../../components/CoursesCart";
import Navbar from "../../components/Navbar";
import { getMyCourses } from "../../services/enrollmentService";
import "./MyCourses.css";

function MyCourses() {
  const [courseItems, setCourseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const StudentName = sessionStorage.getItem("userEmail") || "Student";

  useEffect(() => {
    let active = true;

    getMyCourses()
      .then((data) => {
        if (active) {
          const mapped = data.map((course) => ({
            id: course.courseId,
            name: course.title,
            author: course.instructorName,
            price: course.price,
            rating: 4.5,
            image: `https://picsum.photos/300/200?random=${course.courseId}`,
          }));
          setCourseItems(mapped);
        }
      })
      .catch((err) => {
        console.error("Error fetching my courses:", err);
        if (active) setError("Unable to load your courses.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <h2>Welcome back, {StudentName}</h2>
              <p className="subtitle">Here are all your courses!</p>
            </div>
          </div>

          <h3>My Courses</h3>

          <main className="courses-page">
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && courseItems.length === 0 && (
              <p>You haven't enrolled in any courses yet.</p>
            )}

            <div className="courses-grid">
              {courseItems.map((course) => (
                <CoursesCart key={course.id} course={course} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default MyCourses;