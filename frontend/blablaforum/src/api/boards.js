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
      // Получаем ID доски по slug
      const boardsResponse = await axios.get(`${API_URL}boards/`);
      const board = boardsResponse.data.results.find(b => b.slug === boardSlug);
      
      if (!board) {
        throw new Error(`Доска ${boardSlug} не найдена`);
      }

      const config = {
        headers: {
          'Authorization': `Token ${token}`,
        }
      };

      // Если есть изображение, используем FormData
      if (threadData.image) {
        const formData = new FormData();
        formData.append('title', threadData.title);
        formData.append('content', threadData.content);
        formData.append('board', board.id);
        
        if (threadData.image && threadData.image.size > 0) {
          formData.append('image', threadData.image);
        }

        config.data = formData;
      } else {
        const data = {
          title: threadData.title,
          content: threadData.content,
          board: board.id
        };
        config.headers['Content-Type'] = 'application/json';
        config.data = data;
      }

      // Используем основной API для создания тредов
      const response = await axios.post('http://localhost:8000/api/threads/', config.data, config);
      return response.data;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }
};
