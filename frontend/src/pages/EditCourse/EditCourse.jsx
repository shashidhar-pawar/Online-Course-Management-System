import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./EditCourse.css";
import apiClient from "../../services/apiClient";
import Navbar from "../../components/Navbar";

function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchCourse = async () => {
      try {
        const response = await apiClient.get(`/courses/${id}`);
        if (active) setCourse(response.data);
      } catch (err) {
        console.error(err);
        if (active) setError("Failed to load course details.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCourse();

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (e) => {
    setCourse({
      ...course,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    if (!course.title.trim()) return "Course title is required.";
    if (!course.description.trim()) return "Course description is required.";
    if (!course.price || isNaN(Number(course.price)))
      return "Valid price is required.";

    return "";
  };

  const updateCourse = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      await apiClient.put(`/courses/${id}`, course);

      setSuccess(true);

      setTimeout(() => navigate("/instructordashboard"), 800);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="page d-flex justify-content-center">
        <div className="form-card card shadow-lg border-0">
          <div className="form-header text-center">
            <h1>Edit Course</h1>
            <p>Update your course details below.</p>
          </div>

          {loading ? (
            <p className="loading-msg text-center">Loading course details...</p>
          ) : (
            <form onSubmit={updateCourse}>
              <div className="section">
                <p className="section-title">Course Information</p>

                <div className="field mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="e.g. Complete React Developer Bootcamp"
                    value={course.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="field mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    placeholder="What will students learn?"
                    value={course.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="field field-half mb-3">
                  <label className="form-label">Price (INR)</label>
                  <div className="price-wrap input-group">
                    <span className="input-group-text">Rs.</span>
                    <input
                      type="number"
                      name="price"
                      className="form-control"
                      min="0"
                      step="0.01"
                      placeholder="49.99"
                      value={course.price}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-footer">
                {error && <p className="error-msg">{error}</p>}
                {success && (
                  <p className="success-msg">Course updated successfully!</p>
                )}

                <div className="footer-actions d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-cancel flex-fill"
                    onClick={() => navigate("/instructordashboard")}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-submit flex-fill"
                    disabled={submitting}
                  >
                    {submitting ? "Updating..." : "Update Course"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default EditCourse;
