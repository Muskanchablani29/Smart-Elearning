import api from "./axiosConfig";

export const authService = {
  async login(username, password) {
    const response = await api.post("/auth/token/", { username, password });
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      // Fetch full profile immediately
      const profile = await api.get("/auth/profile/");
      localStorage.setItem("user", JSON.stringify(profile.data));
      return { tokens: response.data, user: profile.data };
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post("/auth/register/", userData);
    if (response.data.tokens?.access) {
      localStorage.setItem("access_token", response.data.tokens.access);
      localStorage.setItem("refresh_token", response.data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get("/auth/profile/");
    localStorage.setItem("user", JSON.stringify(response.data));
    return response.data;
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};
