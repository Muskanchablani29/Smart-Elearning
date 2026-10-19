import api from "./axiosConfig";

export const dashboardService = {
  async getStudentDashboard() {
    const response = await api.get("/dashboard/student/");
    return response.data;
  },

  async getInstructorDashboard() {
    const response = await api.get("/dashboard/instructor/");
    return response.data;
  },

  async getAdminStats() {
    const response = await api.get("/admin/stats/");
    return response.data;
  },

  async getAdminUsers() {
    const response = await api.get("/admin/users/");
    return response.data;
  },

  async updateUserRole(userId, role) {
    const response = await api.patch(`/admin/users/${userId}/`, { role });
    return response.data;
  },
};
