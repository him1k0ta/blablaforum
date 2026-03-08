import React, { useState, useEffect } from 'react';
import { useThreads } from '../ThreadsContext';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Добавлен импорт Link
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../style/admin/AdminPanel.module.css';

const AdminPanel = () => {
  const { adminThreads = [], loading, error, deleteThread, fetchAdminThreads } = useThreads();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.is_superuser) {
      fetchAdminThreads();
    } else {
      navigate('/');
    }
  }, [user, fetchAdminThreads, navigate]);

  const handleDelete = async (threadId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тред?')) {
      try {
        await deleteThread(threadId);
        toast.success('Тред успешно удален');
      } catch (err) {
        toast.error(err.message || 'Ошибка при удалении треда');
      }
    }
  };

  const filteredThreads = (adminThreads || []).filter(thread => {
    if (!thread) return false;
    return (
      thread.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.author?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (!user?.is_superuser) return null;
  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error.message}</div>;

  return (
    <div className={styles.adminPanel}>
      <h1>Административная панель</h1>
      <div className={styles.adminControls}>
        <input
          type="text"
          placeholder="Поиск по тредам..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.threadsList}>
        {filteredThreads.length === 0 ? (
          <div className={styles.noThreads}>Треды не найдены</div>
        ) : (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Автор</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredThreads.map(thread => (
                <tr key={thread.id}>
                  <td>{thread.id}</td>
                  <td>
                    <Link to={`/thread/${thread.id}`} className={styles.threadLink}>
                      {thread.title}
                    </Link>
                  </td>
                  <td>{thread.author?.username || 'Удаленный пользователь'}</td>
                  <td>{new Date(thread.created_at).toLocaleString()}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(thread.id)}
                      className={styles.deleteBtn}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;