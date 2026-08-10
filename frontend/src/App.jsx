import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import CourseDetail from "./pages/CourseDetail/CourseDetail";
import Courses from "./pages/Courses/AllCourses";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import CoursePlayer from "./pages/CoursePlaylist/CoursePlayer";
import InstructorDashboard from "./pages/InstructorDashboard/InstructorDashboard";
import EditCourse from "./pages/EditCourse/EditCourse";
import InstructorCourseUpload from "./pages/Instructor/InstructorCourseUpload";
import MyCourses from "./pages/StudentDashboard/MyCourses";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/allcourses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route
          path="/course/player/:courseId"
          element={
            <ProtectedRoute>
              <CoursePlayer />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route
          path="/instructordashboard"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mycourses"
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <MyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editcourse/:id"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <EditCourse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute requiredRole="INSTRUCTOR">
              <InstructorCourseUpload />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;