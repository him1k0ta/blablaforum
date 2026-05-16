import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaHeart, 
    FaRegHeart, 
    FaComment, 
    FaEye, 
    FaCalendarAlt, 
    FaUser
} from 'react-icons/fa';
import api from '../api';
import '../style/profile.css';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [likedThreads, setLikedThreads] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('my-threads'); // 'my-threads' или 'liked-threads'
    const [currentPage, setCurrentPage] = useState(1);
    const [likedCurrentPage, setLikedCurrentPage] = useState(1);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get('profile/', {
                    params: { page: currentPage, page_size: 10 }
                });
                setProfileData(response.data);
                setError(null);
            } catch (err) {
                setError('Не удалось загрузить профиль. Пожалуйста, войдите в систему.');
                console.error('Profile fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [currentPage]);

    useEffect(() => {
        const fetchLikedThreads = async () => {
            try {
                const response = await api.get('profile/liked/', {
                    params: { page: likedCurrentPage, page_size: 10 }
                });
                setLikedThreads(response.data);
            } catch (err) {
                console.error('Liked threads fetch error:', err);
            }
        };

        if (activeTab === 'liked-threads') {
            fetchLikedThreads();
        }
    }, [activeTab, likedCurrentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleLikedPageChange = (page) => {
        setLikedCurrentPage(page);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Загрузка профиля...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-message">
                    {error}
                    <Link to="/auth" className="login-link">Войти</Link>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="profile-container">
                <div className="error-message">Данные профиля не найдены</div>
            </div>
        );
    }

    const { user, threads, threads_count, total_comments, total_likes, liked_threads_count, pagination } = profileData;
    const currentThreads = activeTab === 'my-threads' ? threads : (likedThreads?.liked_threads || []);
    const currentPagination = activeTab === 'my-threads' ? pagination : (likedThreads?.pagination || {});
    const currentPageNum = activeTab === 'my-threads' ? currentPage : likedCurrentPage;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Профиль пользователя</h1>
                <div className="user-info">
                    <div className="user-avatar">
                        <div className="avatar-placeholder">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="user-details">
                        <h2>{user.username}</h2>
                        <p className="user-email">{user.email}</p>
                        <p className="user-date">Дата регистрации: {new Date(user.date_joined).toLocaleDateString('ru-RU')}</p>
                        {user.is_admin && <span className="admin-badge">Администратор</span>}
                    </div>
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-card">
                    <div className="stat-number">{threads_count}</div>
                    <div className="stat-label">Создано тем</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{total_comments}</div>
                    <div className="stat-label">Комментариев</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{total_likes}</div>
                    <div className="stat-label">Лайков получено</div>
                </div>
            </div>

            {/* Вкладки */}
            <div className="profile-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'my-threads' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-threads')}
                >
                    Мои темы ({threads_count})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'liked-threads' ? 'active' : ''}`}
                    onClick={() => setActiveTab('liked-threads')}
                >
                    Лайкнутые темы ({liked_threads_count})
                </button>
            </div>

            <div className="profile-content">
                <div className="threads-section">
                    <h3>
                        {activeTab === 'my-threads' ? 'Мои темы' : 'Лайкнутые темы'}
                    </h3>
                    
                    {currentThreads && currentThreads.length > 0 ? (
                        <>
                            <div className="threads-list">
                                {currentThreads.map(thread => (
                                    <div key={thread.id} className="thread-item">
                                        <Link to={`/thread/${thread.id}`} className="thread-link">
                                            <div className="thread-header">
                                                <h3>{thread.title}</h3>
                                                {thread.category && (
                                                    <span className="thread-category">{thread.category}</span>
                                                )}
                                            </div>
                                            
                                            <div className="thread-content">
                                                <p>{thread.content ? thread.content.substring(0, 200) + '...' : 'Нет содержимого'}</p>
                                            </div>

                                            <div className="thread-footer">
                                                <div className="thread-meta">
                                                    <span className="meta-item">
                                                        <FaUser className="icon" />
                                                        {thread.author || user.username}
                                                    </span>
                                                    <span className="meta-item">
                                                        <FaCalendarAlt className="icon" />
                                                        {formatDate(thread.created_at)}
                                                    </span>
                                                </div>

                                                <div className="thread-stats">
                                                    <button className={`stat-btn ${thread.is_liked ? 'liked' : ''}`}>
                                                        {thread.is_liked ? (
                                                            <FaHeart className="icon" />
                                                        ) : (
                                                            <FaRegHeart className="icon" />
                                                        )}
                                                        <span>{thread.likes_count || 0}</span>
                                                    </button>

                                                    <span className="stat-item">
                                                        <FaComment className="icon" />
                                                        <span>{thread.comments_count || 0}</span>
                                                    </span>

                                                    <span className="stat-item">
                                                        <FaEye className="icon" />
                                                        <span>{thread.views || 0}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>

                                        {activeTab === 'liked-threads' && (
                                            <div className="thread-author">
                                                Автор: {thread.author}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Пагинация */}
                            {currentPagination && currentPagination.total_pages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => activeTab === 'my-threads' 
                                            ? handlePageChange(currentPageNum - 1)
                                            : handleLikedPageChange(currentPageNum - 1)
                                        }
                                        disabled={!currentPagination.has_prev}
                                    >
                                        ← Назад
                                    </button>
                                    <span className="pagination-info">
                                        Страница {currentPageNum} из {currentPagination.total_pages}
                                    </span>
                                    <button
                                        className="pagination-btn"
                                        onClick={() => activeTab === 'my-threads' 
                                            ? handlePageChange(currentPageNum + 1)
                                            : handleLikedPageChange(currentPageNum + 1)
                                        }
                                        disabled={!currentPagination.has_next}
                                    >
                                        Вперед →
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-threads">
                            <p>
                                {activeTab === 'my-threads' 
                                    ? 'У вас пока нет созданных тем' 
                                    : 'У вас пока нет лайкнутых тем'
                                }
                            </p>
                            {activeTab === 'my-threads' && (
                                <Link to="/create" className="create-thread-btn">Создать первую тему</Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
