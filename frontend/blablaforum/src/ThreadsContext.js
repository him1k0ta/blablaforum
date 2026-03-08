import React, { 
    createContext, 
    useContext, 
    useState, 
    useEffect, 
    useCallback 
  } from 'react';
  import axios from 'axios';
  
  const ThreadsContext = createContext();
  
  export const ThreadsProvider = ({ children }) => {
    const [threads, setThreads] = useState([]);
    const [adminThreads, setAdminThreads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalCount: 0
    });
  
    // Общая функция для обработки ошибок
    const handleError = (err, defaultMessage) => {
      const errorObj = {
        message: err.response?.data?.message || 
                err.response?.data?.detail || 
                err.message || 
                defaultMessage,
        status: err.response?.status,
        data: err.response?.data
      };
      setError(errorObj);
      return errorObj;
    };
  
    // Получение токена
    const getAuthToken = () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      return token;
    };
  
    // Основная функция для запросов
    const apiRequest = async (method, url, data = null, isAdmin = false) => {
      const token = getAuthToken();
      const config = {
        method,
        url: `http://localhost:8000/api${url}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      };
      if (data) config.data = data;
      
      try {
        const response = await axios(config);
        return response.data;
      } catch (err) {
        throw handleError(err, `Failed to ${method} ${url}`);
      }
    };
  
    // Получение списка тредов
    const fetchThreads = useCallback(async (page = 1, pageSize = 10) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:8000/api/threads/', {
          params: { page, page_size: pageSize }
        });
  
        const data = response.data?.results || response.data || [];
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }
  
        setThreads(data);
        setPagination({
          page,
          pageSize,
          totalCount: response.data?.count || data.length
        });
      } catch (err) {
        setError(handleError(err, 'Failed to fetch threads'));
        setThreads([]);
      } finally {
        setLoading(false);
      }
    }, []);
  
    // Получение списка тредов для админа
    const fetchAdminThreads = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest('get', '/admin/threads/', null, true);
        setAdminThreads(Array.isArray(data) ? data : []);
      } catch (err) {
        setAdminThreads([]);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);
  
    // Создание треда
    const createThread = useCallback(async (threadData) => {
      setLoading(true);
      try {
        const newThread = await apiRequest('post', '/threads/', threadData);
        setThreads(prev => [newThread, ...prev]);
        return newThread;
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);
  
    // Удаление треда (админ)
    const deleteThread = useCallback(async (threadId) => {
      setLoading(true);
      try {
        await apiRequest('delete', `/admin/threads/${threadId}/`, null, true);
        setAdminThreads(prev => prev.filter(t => t.id !== threadId));
        setThreads(prev => prev.filter(t => t.id !== threadId));
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);
  
    // Лайк/дизлайк треда
    const toggleLike = useCallback(async (threadId) => {
      try {
        const updatedThread = await apiRequest('post', `/threads/${threadId}/like/`);
        
        setThreads(prev => prev.map(thread => 
          thread.id === threadId ? updatedThread : thread
        ));
        
        setAdminThreads(prev => prev.map(thread => 
          thread.id === threadId ? updatedThread : thread
        ));
        
        return updatedThread;
      } catch (err) {
        throw err;
      }
    }, []);
  
    // Обновление списка тредов
    const refreshThreads = useCallback(() => {
      return fetchThreads(pagination.page, pagination.pageSize);
    }, [fetchThreads, pagination.page, pagination.pageSize]);
  
    // Первоначальная загрузка
    useEffect(() => {
      fetchThreads();
    }, [fetchThreads]);
  
    const value = {
      // Основные данные
      threads: Array.isArray(threads) ? threads : [],
      adminThreads: Array.isArray(adminThreads) ? adminThreads : [],
      loading,
      error,
      pagination,
      
      // Функции
      createThread,
      fetchThreads,
      fetchAdminThreads,
      deleteThread,
      toggleLike,
      refreshThreads,
      setPagination
    };
  
    return (
      <ThreadsContext.Provider value={value}>
        {children}
      </ThreadsContext.Provider>
    );
  };
  
  export const useThreads = () => {
    const context = useContext(ThreadsContext);
    if (!context) {
      throw new Error('useThreads must be used within a ThreadsProvider');
    }
    return context;
  };