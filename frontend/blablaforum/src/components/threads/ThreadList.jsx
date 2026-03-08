import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaEye, 
  FaCalendarAlt, 
  FaUser, 
  FaHome, 
  FaTrash,
  FaEdit
} from 'react-icons/fa';
import styles from '../../style/threads/ThreadList.module.css';
import { useAuth } from '../../AuthContext';

const ThreadList = ({ threads, onLike, onComment, onDelete, onEdit }) => {
  const [expandedThread, setExpandedThread] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [localComments, setLocalComments] = useState({});
  const { user } = useAuth();

  const isAdmin = user?.is_superuser === true;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  const handleLike = (threadId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) onLike(threadId);
  };

  const toggleExpand = (threadId, e) => {
    e.preventDefault();
    setExpandedThread(expandedThread === threadId ? null : threadId);
  };

  const handleDelete = (threadId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm('Вы уверены, что хотите удалить этот тред?')) {
      onDelete(threadId);
    }
  };

  const handleCommentSubmit = (threadId, e) => {
    e.preventDefault();
    if (commentInput.trim()) {
      const newComment = {
        id: Date.now(),
        text: commentInput,
        author: user?.username || 'Вы',
        date: new Date().toISOString()
      };

      setLocalComments(prev => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), newComment]
      }));

      if (onComment) {
        onComment(threadId, commentInput);
      }

      setCommentInput('');
    }
  };

  return (
    <div className={styles.threadsContainer}>
      <div className={styles.headerContainer}>
        <Link to="/" className={styles.homeButton}>
          <FaHome className={styles.homeIcon} />
          На главную
        </Link>
        {isAdmin && (
          <div className={styles.adminControls}>
            <span className={styles.adminBadge}>ADMIN MODE</span>
          </div>
        )}
      </div>
      
      {threads.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Пока нет тредов. Будьте первым!</p>
          <Link to="/new-thread" className={styles.createThreadBtn}>
            Создать тред
          </Link>
        </div>
      ) : (
        <div className={styles.threadsGrid}>
          {threads.map(thread => (
            <div key={thread.id} className={styles.threadCard}>
              <Link to={`/thread/${thread.id}`} className={styles.threadLink}>
                <div className={styles.threadHeader}>
                  <h3 className={styles.threadTitle}>{thread.title}</h3>
                  {thread.category && (
                    <span className={styles.threadCategory}>{thread.category}</span>
                  )}
                </div>
                
                <div className={styles.threadContent}>
                  {expandedThread === thread.id ? (
                    <p>{thread.content}</p>
                  ) : (
                    <p>{thread.content.substring(0, 150)}{thread.content.length > 150 && '...'}</p>
                  )}
                </div>

                <div className={styles.threadFooter}>
                  <div className={styles.threadMeta}>
                    <span className={styles.metaItem}>
                      <FaUser className={styles.icon} />
                      {thread.author?.username || 'Аноним'}
                    </span>
                    <span className={styles.metaItem}>
                      <FaCalendarAlt className={styles.icon} />
                      {formatDate(thread.created_at)}
                    </span>
                  </div>

                  <div className={styles.threadStats}>
                    <button 
                      className={`${styles.statBtn} ${thread.is_liked ? styles.liked : ''}`}
                      onClick={(e) => handleLike(thread.id, e)}
                    >
                      {thread.is_liked ? (
                        <FaHeart className={styles.icon} />
                      ) : (
                        <FaRegHeart className={styles.icon} />
                      )}
                      <span>{thread.likes_count || 0}</span>
                    </button>

                    <button 
                      className={styles.statBtn}
                      onClick={(e) => toggleExpand(thread.id, e)}
                    >
                      <FaComment className={styles.icon} />
                      <span>{thread.comments_count || 0}</span>
                    </button>

                    <span className={styles.statItem}>
                      <FaEye className={styles.icon} />
                      {thread.views || 0}
                    </span>

                    {isAdmin && (
                      <button 
                        className={`${styles.deleteBtn} ${styles.adminOnly}`}
                        onClick={(e) => handleDelete(thread.id, e)}
                      >
                        <FaTrash className={styles.icon} />
                        <span>Удалить</span>
                      </button>
                    )}
                  </div>
                </div>
              </Link>

              {expandedThread === thread.id && (
                <div className={styles.commentsSection}>
                  <div className={styles.commentsList}>
                    {(localComments[thread.id] || []).map(comment => (
                      <div key={comment.id} className={styles.comment}>
                        <div className={styles.commentHeader}>
                          <span className={styles.commentAuthor}>{comment.author}</span>
                          <span className={styles.commentDate}>
                            {formatDate(comment.date)}
                          </span>
                        </div>
                        <p className={styles.commentText}>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                  <form 
                    onSubmit={(e) => handleCommentSubmit(thread.id, e)}
                    className={styles.commentForm}
                  >
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Напишите комментарий..."
                      className={styles.commentInput}
                    />
                    <button type="submit" className={styles.commentSubmit}>
                      Отправить
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadList;