import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { boardsAPI } from '../api/boards';
import ThreadList from '../components/threads/ThreadList';
import CreateThreadFormWithImage from '../components/threads/new/CreateThreadFormWithImage';
import styles from '../style/boards/BoardPage.module.css';

const BoardPage = () => {
  const { slug } = useParams();
  const [board, setBoard] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBoardData();
    }
  }, [slug]);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      
      // Параллельно загружаем информацию о доске и треды
      const [boardData, threadsData] = await Promise.all([
        boardsAPI.getBoardBySlug(slug),
        boardsAPI.getBoardThreads(slug)
      ]);

      setBoard(boardData);
      setThreads(threadsData.results || threadsData);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить доску');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleThreadCreated = (newThread) => {
    setThreads(prev => [newThread, ...prev]);
    setShowCreateForm(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка доски...</div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error || 'Доска не найдена'}</p>
          <Link to="/boards" className={styles.backLink}>
            ← Вернуться к доскам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header с информацией о доске */}
      <div className={styles.boardHeader}>
        <Link to="/boards" className={styles.backLink}>
          ← Вернуться к доскам
        </Link>
        
        <div className={styles.boardInfo}>
          <h1 className={styles.boardTitle}>
            <span className={styles.boardSlug}>/{board.slug}/</span>
            {' '}{board.name}
          </h1>
          
          {board.description && (
            <p className={styles.boardDescription}>{board.description}</p>
          )}
          
          <div className={styles.boardMeta}>
            <span className={`status ${board.is_active ? 'active' : 'inactive'}`}>
              {board.is_active ? 'Активна' : 'Неактивна'}
            </span>
            <span className={styles.threadCount}>
              {threads.length} тредов
            </span>
          </div>
        </div>

        <button 
          className={styles.createThreadBtn}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Отменить' : 'Создать тред'}
        </button>
      </div>

      {/* Форма создания треда */}
      {showCreateForm && (
        <div className={styles.createFormContainer}>
          <CreateThreadFormWithImage 
            boardSlug={board.slug}
            onThreadCreated={handleThreadCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Список тредов */}
      <div className={styles.threadsContainer}>
        {threads.length === 0 ? (
          <div className={styles.empty}>
            <p>В этой доске пока нет тредов</p>
            {!showCreateForm && (
              <button 
                className={styles.createFirstThreadBtn}
                onClick={() => setShowCreateForm(true)}
              >
                Создать первый тред
              </button>
            )}
          </div>
        ) : (
          <ThreadList 
            threads={threads} 
            showHomeButton={false}
            onThreadUpdate={fetchBoardData}
          />
        )}
      </div>
    </div>
  );
};

export default BoardPage;
