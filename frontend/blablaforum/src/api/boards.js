import axios from 'axios';

const API_URL = 'http://localhost:8000/api/forums/';

export const boardsAPI = {
  // Получить все доски
  getAllBoards: async () => {
    try {
      const response = await axios.get(`${API_URL}boards/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching boards:', error);
      throw error;
    }
  },

  // Получить доску по slug
  getBoardBySlug: async (slug) => {
    try {
      const response = await axios.get(`${API_URL}boards/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching board:', error);
      throw error;
    }
  },

  // Получить треды доски
  getBoardThreads: async (slug, page = 1) => {
    try {
      const response = await axios.get(`${API_URL}boards/${slug}/threads/?page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching board threads:', error);
      throw error;
    }
  },

  // Создать тред в доске
  createThreadInBoard: async (boardSlug, threadData, token) => {
    try {
      const config = {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Если есть изображение, используем FormData
      if (threadData.image) {
        const formData = new FormData();
        formData.append('title', threadData.title);
        formData.append('content', threadData.content);
        formData.append('board', boardSlug);
        
        if (threadData.image && threadData.image.size > 0) {
          formData.append('image', threadData.image);
        }

        delete config.headers['Content-Type'];
        config.data = formData;
      } else {
        threadData.board = boardSlug;
        config.data = threadData;
      }

      const response = await axios.post(`${API_URL}threads/`, config.data, config);
      return response.data;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }
};
