import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import '../style/global.css';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [likedThreads, setLikedThreads] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('my-threads');
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

    if (loading) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Загрузка профиля...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="card error-card">
                        <div className="card-body">
                            <div className="error-icon">⚠️</div>
                            <h3>Ошибка загрузки</h3>
                            <p>{error}</p>
                            <Link to="/auth" className="btn btn-primary">
                                Войти в систему
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="card error-card">
                        <div className="card-body">
                            <div className="error-icon">📭</div>
                            <h3>Профиль не найден</h3>
                            <p>Данные профиля не найдены</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { user, threads, threads_count, total_comments, total_likes, liked_threads_count, pagination } = profileData;
    const currentThreads = activeTab === 'my-threads' ? threads : (likedThreads?.liked_threads || []);
    const currentPagination = activeTab === 'my-threads' ? pagination : (likedThreads?.pagination || {});
    const currentPageNum = activeTab === 'my-threads' ? currentPage : likedCurrentPage;

    const ThreadCard = ({ thread, isLiked = false }) => (
        <div className="card thread-card fade-in">
            <div className="card-body">
                <div className="thread-header">
                    <h3 className="thread-title">
                        <Link to={`/thread/${thread.id}`}>{thread.title}</Link>
                    </h3>
                    {isLiked && <span className="liked-badge">❤️ Лайкнуто</span>}
                </div>
                <p className="thread-excerpt">
                    {thread.content ? thread.content.substring(0, 150) + '...' : 'Нет описания'}
                </p>
                <div className="thread-meta">
                    <div className="thread-category">
                        <span className="category-badge">{thread.category || 'Общее'}</span>
                    </div>
                    <div className="thread-stats">
                        <span className="stat-item">
                            <span className="stat-icon">💬</span>
                            {thread.comments_count || 0}
                        </span>
                        <span className="stat-item">
                            <span className="stat-icon">❤️</span>
                            {thread.likes_count || 0}
                        </span>
                        <span className="stat-item">
                            <span className="stat-icon">👁️</span>
                            {thread.views || 0}
                        </span>
                    </div>
                </div>
                <div className="thread-time">
                    {new Date(thread.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
        </div>
    );

    const Pagination = ({ pagination, onPageChange }) => {
        if (!pagination || pagination.total_pages <= 1) return null;

        const { current_page, total_pages, has_next, has_prev } = pagination;

        return (
            <div className="pagination">
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={!has_prev}
                >
                    ← Назад
                </button>
                <span className="pagination-info">
                    Страница {current_page} из {total_pages}
                </span>
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={!has_next}
                >
                    Вперед →
                </button>
            </div>
        );
    };

    return (
        <div className="profile-page">
            <div className="container">
                {/* Профиль хедер */}
                <section className="profile-hero">
                    <div className="profile-header-card">
                        <div className="profile-avatar">
                            <img 
                                src={`https://picsum.photos/seed/${user.username}/120/120.jpg`} 
                                alt={user.username}
                                className="avatar-img"
                            />
                        </div>
                        <div className="profile-info">
                            <h1 className="profile-name">{user.username}</h1>
                            <p className="profile-email">{user.email}</p>
                            <div className="profile-stats">
                                <div className="stat-item">
                                    <div className="stat-value">{threads_count}</div>
                                    <div className="stat-label">Треды</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{total_comments}</div>
                                    <div className="stat-label">Комментарии</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{total_likes}</div>
                                    <div className="stat-label">Лайки</div>
                                </div>
                            </div>
                            <div className="profile-actions">
                                <Link to="/create" className="btn btn-primary">
                                    <span>✍️</span>
                                    Создать тред
                                </Link>
                                <button className="btn btn-outline">
                                    <span>⚙️</span>
                                    Настройки
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Вкладки */}
                <section className="profile-tabs-section">
                    <div className="tabs-container">
                        <div className="tabs-header">
                            <button
                                className={`tab-btn ${activeTab === 'my-threads' ? 'active' : ''}`}
                                onClick={() => setActiveTab('my-threads')}
                            >
                                <span>📝</span>
                                Мои темы
                                <span className="tab-count">({threads_count})</span>
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'liked-threads' ? 'active' : ''}`}
                                onClick={() => setActiveTab('liked-threads')}
                            >
                                <span>❤️</span>
                                Лайкнутые темы
                                <span className="tab-count">({liked_threads_count})</span>
                            </button>
                        </div>

                        <div className="tabs-content">
                            {currentThreads.length > 0 ? (
                                <>
                                    <div className="threads-grid">
                                        {currentThreads.map(thread => (
                                            <ThreadCard 
                                                key={thread.id} 
                                                thread={thread} 
                                                isLiked={activeTab === 'liked-threads'}
                                            />
                                        ))}
                                    </div>
                                    <div className="pagination-container">
                                        <Pagination
                                            pagination={currentPagination}
                                            onPageChange={activeTab === 'my-threads' ? handlePageChange : handleLikedPageChange}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        {activeTab === 'my-threads' ? '📝' : '❤️'}
                                    </div>
                                    <h3>
                                        {activeTab === 'my-threads' ? 'У вас пока нет тредов' : 'У вас пока нет лайкнутых тредов'}
                                    </h3>
                                    <p>
                                        {activeTab === 'my-threads' 
                                            ? 'Создайте свой первый тред и начните общение!'
                                            : 'Лайкайте треды, чтобы они появились здесь'
                                        }
                                    </p>
                                    {activeTab === 'my-threads' && (
                                        <Link to="/create" className="btn btn-primary">
                                            Создать первый тред
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .profile-page {
                    min-height: 100vh;
                    background: var(--bg-secondary);
                    padding: 2rem 0;
                }

                .loading-container {
                    text-align: center;
                    padding: 4rem 2rem;
                }

                .loading-spinner {
                    width: 48px;
                    height: 48px;
                    border: 3px solid var(--border-color);
                    border-top: 3px solid var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .error-card {
                    max-width: 500px;
                    margin: 4rem auto;
                    text-align: center;
                }

                .error-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .error-card h3 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }

                .error-card p {
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                }

                .profile-hero {
                    margin-bottom: 3rem;
                }

                .profile-header-card {
                    background: var(--bg-primary);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    border: 1px solid var(--border-color);
                }

                .profile-avatar {
                    flex-shrink: 0;
                }

                .avatar-img {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid var(--primary-color);
                }

                .profile-info {
                    flex: 1;
                }

                .profile-name {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }

                .profile-email {
                    color: var(--text-secondary);
                    margin-bottom: 1.5rem;
                    font-size: 1.125rem;
                }

                .profile-stats {
                    display: flex;
                    gap: 3rem;
                    margin-bottom: 2rem;
                }

                .profile-stats .stat-item {
                    text-align: center;
                }

                .profile-stats .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin-bottom: 0.25rem;
                }

                .profile-stats .stat-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .profile-actions {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .tabs-container {
                    background: var(--bg-primary);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-lg);
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }

                .tabs-header {
                    display: flex;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-color);
                }

                .tab-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 1.25rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-weight: 500;
                    color: var(--text-secondary);
                    transition: var(--transition);
                    position: relative;
                }

                .tab-btn:hover {
                    color: var(--primary-color);
                    background: rgba(37, 99, 235, 0.05);
                }

                .tab-btn.active {
                    color: var(--primary-color);
                    background: var(--bg-primary);
                }

                .tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: var(--primary-color);
                }

                .tab-count {
                    background: var(--primary-color);
                    color: white;
                    padding: 0.125rem 0.5rem;
                    border-radius: var(--radius);
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .tab-btn:not(.active) .tab-count {
                    background: var(--secondary-color);
                }

                .tabs-content {
                    padding: 2rem;
                }

                .threads-grid {
                    display: grid;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .thread-card {
                    transition: var(--transition);
                }

                .thread-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .thread-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .thread-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin: 0;
                }

                .thread-title a {
                    color: var(--text-primary);
                    text-decoration: none;
                    transition: var(--transition);
                }

                .thread-title a:hover {
                    color: var(--primary-color);
                }

                .liked-badge {
                    background: var(--danger-color);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: var(--radius);
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .thread-excerpt {
                    color: var(--text-secondary);
                    margin-bottom: 1rem;
                    font-size: 0.875rem;
                    line-height: 1.5;
                }

                .thread-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }

                .thread-category {
                    flex-shrink: 0;
                }

                .category-badge {
                    background: var(--primary-color);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: var(--radius);
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .thread-stats {
                    display: flex;
                    gap: 1rem;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .stat-icon {
                    font-size: 0.875rem;
                }

                .thread-time {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .empty-state h3 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }

                .empty-state p {
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                }

                .pagination-container {
                    display: flex;
                    justify-content: center;
                    margin-top: 2rem;
                }

                .pagination {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .pagination-info {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    min-width: 120px;
                    text-align: center;
                }

                @media (max-width: 768px) {
                    .profile-header-card {
                        flex-direction: column;
                        text-align: center;
                        gap: 1.5rem;
                    }

                    .profile-stats {
                        justify-content: center;
                        gap: 2rem;
                    }

                    .profile-actions {
                        justify-content: center;
                    }

                    .tabs-header {
                        flex-direction: column;
                    }

                    .tab-btn {
                        border-bottom: 1px solid var(--border-color);
                    }

                    .tab-btn:last-child {
                        border-bottom: none;
                    }

                    .thread-meta {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .pagination {
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Profile;
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
                    <div className="stat-label">Лайков поставлено</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{liked_threads_count}</div>
                    <div className="stat-label">Лайкнутых тем</div>
                </div>
            </div>

            <div className="threads-tabs">
                <div className="tab-buttons">
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

                {activeTab === 'my-threads' && (
                    <div className="tab-actions">
                        <Link to="/create" className="create-thread-btn">Создать новую тему</Link>
                    </div>
                )}
            </div>

            <div className="threads-content">
                {currentThreads.length === 0 ? (
                    <div className="no-threads">
                        <p>
                            {activeTab === 'my-threads' 
                                ? 'У вас пока нет созданных тем' 
                                : 'Вы пока не лайкали никакие темы'
                            }
                        </p>
                        {activeTab === 'my-threads' && (
                            <Link to="/create" className="create-first-thread">Создать первую тему</Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="threads-list">
                            {currentThreads.map(thread => (
                                <div key={thread.id} className="thread-item">
                                    <Link to={`/thread/${thread.id}`} className="thread-link">
                                        <h4 className="thread-title">{thread.title}</h4>
                                        <div className="thread-meta">
                                            <span className="thread-date">
                                                {new Date(thread.created_at).toLocaleDateString('ru-RU')}
                                            </span>
                                            <span className="thread-views">{thread.views} просмотров</span>
                                            <span className="thread-likes">{thread.likes_count} лайков</span>
                                            <span className="thread-comments">{thread.comments_count} комментариев</span>
                                        </div>
                                        {thread.is_liked && <span className="user-liked">Вы лайкнули</span>}
                                        {thread.category && <span className="thread-category">{thread.category}</span>}
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {currentPagination.total_pages > 1 && (
                            <div className="pagination">
                                <button 
                                    className="pagination-btn"
                                    disabled={!currentPagination.has_prev}
                                    onClick={() => {
                                        if (activeTab === 'my-threads') {
                                            handlePageChange(currentPageNum - 1);
                                        } else {
                                            handleLikedPageChange(currentPageNum - 1);
                                        }
                                    }}
                                >
                                    ← Назад
                                </button>
                                
                                <span className="pagination-info">
                                    Страница {currentPagination.current_page} из {currentPagination.total_pages}
                                </span>
                                
                                <button 
                                    className="pagination-btn"
                                    disabled={!currentPagination.has_next}
                                    onClick={() => {
                                        if (activeTab === 'my-threads') {
                                            handlePageChange(currentPageNum + 1);
                                        } else {
                                            handleLikedPageChange(currentPageNum + 1);
                                        }
                                    }}
                                >
                                    Вперед →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
