import apiClient from "./apiClient";

export const enrollInCourse = async (courseId) => {
    const response = await apiClient.post(`/enrollments/${courseId}`);
    return response.data;
};

export const getMyCourses = async () => {
    const response = await apiClient.get("/enrollments/my-courses");
    return response.data;
};