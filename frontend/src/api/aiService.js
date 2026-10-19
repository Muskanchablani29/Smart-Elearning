import api from "./axiosConfig";

export const aiService = {
  async getModelStatus() {
    const response = await api.get("/ai-model/status/");
    return response.data;
  },

  async sendTutorMessage(message, topicId = null) {
    const response = await api.post("/ai-tutor/chat/", {
      message,
      topic_id: topicId,
    });
    return response.data;
  },
};
