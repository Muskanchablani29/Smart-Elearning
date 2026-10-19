import api from "./axiosConfig";

export const quizService = {
  async getQuizQuestions(topicId, difficulty = null) {
    const params = difficulty ? { difficulty } : {};
    const response = await api.get(`/quizzes/topic/${topicId}/`, { params });
    return response.data;
  },

  async generateAIQuiz(topicId, difficulty = "beginner", count = 3) {
    const response = await api.post(`/topics/${topicId}/generate-quiz/`, {
      difficulty,
      count,
    });
    return response.data;
  },

  async submitQuiz(topicId, answers, difficulty = "beginner") {
    const response = await api.post("/quizzes/submit/", {
      topic_id: topicId,
      difficulty: difficulty,
      answers: answers,
    });
    return response.data;
  },

  async getQuizHistory(topicId = null) {
    const params = topicId ? { topic: topicId } : {};
    const response = await api.get("/quizzes/history/", { params });
    return response.data;
  },

  async getAttemptDetail(attemptId) {
    const response = await api.get(`/quizzes/attempts/${attemptId}/`);
    return response.data;
  },

  // Instructor/Admin question management
  async getQuestionsManage(topicId = null) {
    const params = topicId ? { topic: topicId } : {};
    const response = await api.get("/quizzes/questions/", { params });
    return response.data;
  },

  async createQuestion(questionData) {
    const response = await api.post("/quizzes/questions/", questionData);
    return response.data;
  },

  async deleteQuestion(id) {
    const response = await api.delete(`/quizzes/questions/${id}/`);
    return response.data;
  },
};
