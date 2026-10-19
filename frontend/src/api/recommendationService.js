import api from "./axiosConfig";

export const recommendationService = {
  async getRecommendations() {
    const response = await api.get("/recommendations/");
    return response.data;
  },

  async refreshRecommendations() {
    const response = await api.post("/recommendations/refresh/");
    return response.data;
  },
};
