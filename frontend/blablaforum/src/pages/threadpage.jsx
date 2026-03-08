import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaArrowLeft, FaUser, FaCalendarAlt, FaEye, FaReply, FaTimes, FaTrash } from 'react-icons/fa';
import api from '../api';
import styles from '../style/threads/ThreadPage.module.css';
import { useAuth } from '../AuthContext';

const ThreadPage = ({ updateThreadInList }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, isAdmin } = useAuth();
    const [thread, setThread] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isProcessingLike, setIsProcessingLike] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        const fetchThread = async () => {
            try {
                const [threadRes, commentsRes] = await Promise.all([
                    api.get(`/threads/${id}/`),
                    api.get(`/threads/${id}/comments/`)
                ]);
                setThread({...threadRes.data, is_liked: threadRes.data.is_liked || false});
                const commentsData = Array.isArray(commentsRes.data) ? commentsRes.data : commentsRes.data?.results || [];
                setComments(commentsData);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка загрузки треда');
                console.error('Ошибка при загрузке треда:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchThread();
    }, [id]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/thread/${id}` } });
            return;
        }
        if (isProcessingLike || !thread) return;
        setIsProcessingLike(true);
        try {
            const method = thread.is_liked ? 'delete' : 'post';
            const response = await api[method](`/threads/${thread.id}/like/`);
            if (response.status >= 200 && response.status < 300) {
                const updatedThread = {
                    ...thread,
                    is_liked: !thread.is_liked,
                    likes_count: thread.is_liked ? thread.likes_count - 1 : thread.likes_count + 1
                };
                setThread(updatedThread);
                if (updateThreadInList) {
                    updateThreadInList(thread.id, {
                        is_liked: updatedThread.is_liked,
                        likes_count: updatedThread.likes_count
                    });
                }
            } else {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
        } catch (err) {
            console.error('Ошибка при обработке лайка:', err);
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            } else {
                setError('Не удалось обновить лайк. Попробуйте позже.');
            }
        } finally {
            setIsProcessingLike(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/thread/${id}` } });
            return;
        }
        const text = replyingTo ? replyText : commentText;
        if (!text.trim() || isSubmittingComment || !thread) return;
        setIsSubmittingComment(true);
        try {
            const response = await api.post(`/threads/${thread.id}/comments/`, {
                text: text,
                parent_id: replyingTo?.id
            });
            if (response.status >= 200 && response.status < 300) {
                const newComment = {
                    ...response.data,
                    author: user,
                    replies: []
                };
                if (replyingTo) {
                    setComments(prev => prev.map(comment => {
                        if (comment.id === replyingTo.id) {
                            return {...comment, replies: [...(comment.replies || []), newComment]};
                        }
                        return comment;
                    }));
                    setReplyingTo(null);
                    setReplyText('');
                } else {
                    setComments(prev => [newComment, ...prev]);
                    setCommentText('');
                }
                const updatedThread = {...thread, comments_count: thread.comments_count + 1};
                setThread(updatedThread);
                if (updateThreadInList) {
                    updateThreadInList(thread.id, {comments_count: updatedThread.comments_count});
                }
            } else {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
        } catch (err) {
            console.error('Ошибка при отправке комментария:', err);
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            } else {
                setError('Не удалось отправить комментарий. Попробуйте снова.');
            }
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId, isReply, parentId) => {
        if (!isAuthenticated) return;
        try {
            await api.delete(`/comments/${commentId}/`);
            if (isReply) {
                setComments(prev => prev.map(comment => {
                    if (comment.id === parentId) {
                        return {...comment, replies: comment.replies?.filter(reply => reply.id !== commentId) || []};
                    }
                    return comment;
                }));
            } else {
                setComments(prev => prev.filter(comment => comment.id !== commentId));
            }
            const updatedThread = {...thread, comments_count: thread.comments_count - 1};
            setThread(updatedThread);
            if (updateThreadInList) {
                updateThreadInList(thread.id, {comments_count: updatedThread.comments_count});
            }
        } catch (err) {
            console.error('Ошибка при удалении комментария:', err);
            setError('Не удалось удалить комментарий');
        }
    };

    const handleDeleteThread = async () => {
        if (!isAdmin) return;
        
        try {
            await api.delete(`/threads/${thread.id}/`);
            navigate('/threads');
        } catch (err) {
            console.error('Ошибка при удалении треда:', err);
            setError('Не удалось удалить тред');
        }
    };

    const handleReply = (comment) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/thread/${id}` } });
            return;
        }
        setReplyingTo(comment);
        setReplyText(`@${comment.author?.username || 'Аноним'}, `);
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setReplyText('');
    };

    if (loading) return <div className={styles.loading}>Загрузка...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!thread) return <div className={styles.error}>Тред не найден</div>;

    return (
        <div className={styles.threadPage}>
            <div className={styles.threadHeaderActions}>
                <Link to="/threads" className={styles.backButton}>
                    <FaArrowLeft/> Назад к списку тредов
                </Link>
                {isAdmin && (
                    <button onClick={handleDeleteThread} className={styles.deleteThreadButton} title="Удалить тред">
                        <FaTrash/> Удалить тред
                    </button>
                )}
            </div>
            <div className={styles.threadContainer}>
                <div className={styles.threadHeader}>
                    <h1 className={styles.threadTitle}>{thread.title}</h1>
                    {thread.category && <span className={styles.threadCategory}>{thread.category}</span>}
                </div>
                <div className={styles.threadMeta}>
                    <span className={styles.author}><FaUser/> {thread.author?.username || 'Аноним'}</span>
                    <span className={styles.date}><FaCalendarAlt/> {new Date(thread.created_at).toLocaleDateString('ru-RU')}</span>
                    <span className={styles.views}><FaEye/> {thread.views} просмотров</span>
                </div>
                <div className={styles.threadContent}><p>{thread.content}</p></div>
                <div className={styles.threadActions}>
                    <button onClick={handleLike} className={`${styles.likeButton} ${thread.is_liked ? styles.liked : ''}`} disabled={isProcessingLike} title={isAuthenticated ? '' : 'Войдите, чтобы поставить лайк'}>
                        {thread.is_liked ? <FaHeart className={styles.likedIcon}/> : <FaRegHeart/>}
                        <span>{thread.likes_count}</span>
                        {isProcessingLike && <span className={styles.spinner}></span>}
                    </button>
                </div>
                {thread.tags?.length > 0 && (
                    <div className={styles.threadTags}>
                        {thread.tags.map(tag => <span key={tag} className={styles.tag}>#{tag}</span>)}
                    </div>
                )}
            </div>
            <div className={styles.commentsSection}>
                <h2 className={styles.commentsTitle}><FaComment/> Комментарии ({thread.comments_count})</h2>
                {isAuthenticated ? (
                    <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                        <textarea value={replyingTo ? replyText : commentText} onChange={(e) => replyingTo ? setReplyText(e.target.value) : setCommentText(e.target.value)} placeholder={replyingTo ? `Ответ ${replyingTo.author?.username || 'Анониму'}` : "Напишите ваш комментарий..."} className={styles.commentInput} rows="3" required/>
                        <div className={styles.commentButtons}>
                            {replyingTo && <button type="button" onClick={cancelReply} className={styles.cancelReplyButton}><FaTimes/> Отменить ответ</button>}
                            <button type="submit" className={styles.commentSubmit} disabled={(replyingTo ? !replyText.trim() : !commentText.trim()) || isSubmittingComment}>
                                {isSubmittingComment ? 'Отправка...' : 'Отправить'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className={styles.authPrompt}><Link to="/login" className={styles.loginLink}>Войдите</Link>, чтобы оставить комментарий</div>
                )}
                <div className={styles.commentsList}>
                    {comments.length === 0 ? (
                        <p className={styles.noComments}>Пока нет комментариев. Будьте первым!</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className={styles.comment}>
                                <div className={styles.commentHeader}>
                                    <span className={styles.commentAuthor}><FaUser/> {comment.author?.username || 'Аноним'}</span>
                                    <span className={styles.commentDate}><FaCalendarAlt/> {new Date(comment.created_at).toLocaleString('ru-RU')}</span>
                                    <div className={styles.commentActions}>
                                        {isAuthenticated && user?.id === comment.author?.id && (
                                            <button onClick={() => handleDeleteComment(comment.id, false)} className={styles.deleteButton} title="Удалить комментарий">
                                                <FaTrash/>
                                            </button>
                                        )}
                                        {isAuthenticated && (
                                            <button onClick={() => handleReply(comment)} className={styles.replyButton} title="Ответить">
                                                <FaReply/> Ответить
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.commentText}>{comment.text}</div>
                                {comment.replies?.length > 0 && (
                                    <div className={styles.replies}>
                                        {comment.replies.map(reply => (
                                            <div key={reply.id} className={styles.reply}>
                                                <div className={styles.commentHeader}>
                                                    <span className={styles.commentAuthor}><FaUser/> {reply.author?.username || 'Аноним'}</span>
                                                    <span className={styles.commentDate}><FaCalendarAlt/> {new Date(reply.created_at).toLocaleString('ru-RU')}</span>
                                                    <div className={styles.commentActions}>
                                                        {isAuthenticated && user?.id === reply.author?.id && (
                                                            <button onClick={() => handleDeleteComment(reply.id, true, comment.id)} className={styles.deleteButton} title="Удалить ответ">
                                                                <FaTrash/>
                                                            </button>
                                                        )}
                                                        {isAuthenticated && (
                                                            <button onClick={() => handleReply(reply)} className={styles.replyButton} title="Ответить">
                                                                <FaReply/> Ответить
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={styles.commentText}>{reply.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThreadPage;