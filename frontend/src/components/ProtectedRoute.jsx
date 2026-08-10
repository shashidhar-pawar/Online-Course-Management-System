import { Navigate } from "react-router-dom";

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const payload = decodeToken(token);

  if (!payload) {
    return <Navigate to="/login" replace />;
  }

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && payload.user_role !== requiredRole) {
    return <Navigate to="/allcourses" replace />;
  }

  return children;
}

export default ProtectedRoute;