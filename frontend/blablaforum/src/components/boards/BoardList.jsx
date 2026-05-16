import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { boardsAPI } from '../../api/boards';
import styles from './BoardList.module.css';

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const data = await boardsAPI.getAllBoards();
      setBoards(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить доски');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка досок...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchBoards} className={styles.retryBtn}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Доски</h1>
      
      {boards.length === 0 ? (
        <div className={styles.empty}>
          <p>Досок пока нет</p>
        </div>
      ) : (
        <div className={styles.boardsGrid}>
          {boards.map(board => (
            <Link 
              key={board.id} 
              to={`/board/${board.slug}`} 
              className={styles.boardCard}
            >
              <div className={styles.boardHeader}>
                <h2 className={styles.boardName}>/{board.slug}/</h2>
                <span className={styles.boardTitle}>{board.name}</span>
              </div>
              
              <p className={styles.boardDescription}>
                {board.description || 'Нет описания'}
              </p>
              
              <div className={styles.boardMeta}>
                <span className={styles.boardStatus}>
                  {board.is_active ? 'Активна' : 'Неактивна'}
                </span>
                <span className={styles.boardDate}>
                  Создана: {new Date(board.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardList;
