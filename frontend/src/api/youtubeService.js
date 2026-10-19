import api from "./axiosConfig";

export const youtubeService = {
  async getYouTubeRecommendations({ topicId = null, query = null, maxResults = 4 } = {}) {
    const params = { max_results: maxResults };
    if (topicId) params.topic = topicId;
    if (query) params.query = query;

    const response = await api.get("/youtube/recommendations/", { params });
    return response.data;
  },
};
