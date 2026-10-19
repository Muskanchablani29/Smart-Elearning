import api from "./axiosConfig";

export const learningService = {
  async getSubjects() {
    const response = await api.get("/subjects/");
    return response.data;
  },

  async getSubject(id) {
    const response = await api.get(`/subjects/${id}/`);
    return response.data;
  },

  async createSubject(subjectData) {
    const response = await api.post("/subjects/", subjectData);
    return response.data;
  },

  async getTopics(subjectId = null) {
    const params = subjectId ? { subject: subjectId } : {};
    const response = await api.get("/topics/", { params });
    return response.data;
  },

  async getTopic(id) {
    const response = await api.get(`/topics/${id}/`);
    return response.data;
  },

  async createTopic(topicData) {
    const response = await api.post("/topics/", topicData);
    return response.data;
  },

  async getMaterials(topicId = null) {
    const params = topicId ? { topic: topicId } : {};
    const response = await api.get("/materials/", { params });
    return response.data;
  },

  async createMaterial(materialData) {
    const response = await api.post("/materials/", materialData);
    return response.data;
  },

  async deleteMaterial(id) {
    const response = await api.delete(`/materials/${id}/`);
    return response.data;
  },

  async markProgress(topicId, status, percent = 100.0) {
    const response = await api.post("/progress/mark/", {
      topic_id: topicId,
      status: status,
      percent_complete: percent,
    });
    return response.data;
  },

  async getMyProgress() {
    const response = await api.get("/progress/");
    return response.data;
  },

  // Course / Degree Management
  async getCourses(code = null) {
    const params = code ? { code } : {};
    const response = await api.get("/courses/", { params });
    return response.data;
  },

  async getCourse(id) {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  },

  // Student Profile Isolation & Personalization
  async getStudentProfile() {
    const response = await api.get("/student/profile/");
    return response.data;
  },

  async updateStudentProfile(profileData) {
    const response = await api.patch("/student/profile/", profileData);
    return response.data;
  },

  // Completed Resources Tracking (YouTube Videos)
  async getCompletedResources() {
    const response = await api.get("/resources/completed/");
    return response.data;
  },

  async toggleResourceCompleted(topicId, resourceId, title, resourceType = "youtube_video") {
    const response = await api.post("/resources/completed/toggle/", {
      topic_id: topicId,
      resource_id: resourceId,
      title: title,
      resource_type: resourceType,
    });
    return response.data;
  },

  // YouTube Video Tutorial Recommendations
  async getYoutubeRecommendations(topicId = null, query = null) {
    const params = {};
    if (topicId) params.topic = topicId;
    if (query) params.query = query;
    const response = await api.get("/youtube/recommendations/", { params });
    return response.data;
  },
};

