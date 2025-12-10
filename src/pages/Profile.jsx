import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);

    const [articles, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [articleDetails, setArticleDetails] = useState(null);

    useEffect(() => {
        fetchArticlesFromMCP();
    }, []);

    const fetchArticlesFromMCP = async () => {
        try {
            setLoadingArticles(true);
            const response = await fetch('http://localhost:5002/list_articles');
            const data = await response.json();

            if (data.status === 'success') {
                setArticles(data.articles || []);
            }
        } catch (error) {
            console.error('Ошибка загрузки статей:', error);
        } finally {
            setLoadingArticles(false);
        }
    };

    const fetchArticleDetails = async (id) => {
        try {
            const response = await fetch(`http://localhost:5002/get_article/${id}`);
            const data = await response.json();

            if (data.status === 'success') {
                setArticleDetails(data.article);
            }
        } catch (error) {
            console.error('Ошибка загрузки деталей:', error);
        }
    };

    const cleanText = (text) => {
        if (!text) return '';
        return text.replace(/_/g, ' ').replace(/\|/g, ', ').replace(/прямое\d+\.\d+/g, '').replace(/косвенное\d+\.\d+/g, '').replace(/\s+/g, ' ').trim();
    };

    const formatKeywords = (keywords) => {
        if (!keywords) return 'Не указаны';
        const cleaned = cleanText(keywords);
        const words = cleaned.split(/[,\s]+/).filter(word => word.length > 2).slice(0, 5);
        return words.length > 0 ? words.join(', ') : 'Не указаны';
    };

    const getFirstKeyword = (keywords) => {
        if (!keywords) return 'Без темы';
        const cleaned = cleanText(keywords);
        const firstWord = cleaned.split(/[,\s]+/)[0];
        return firstWord && firstWord.length > 2 ? firstWord : 'Без темы';
    };

    const formatRubric = (rubric) => {
        if (!rubric) return 'Не указана';
        return cleanText(rubric);
    };

    const handleArticleClick = (article) => {
        setSelectedArticle(article);
        fetchArticleDetails(article.id);
    };

    const closeModal = () => {
        setSelectedArticle(null);
        setArticleDetails(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateProfile({ avatar: reader.result });
                setIsEditingAvatar(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const getInitials = (username) => {
        return username.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="profile-container">
            <div className="profile-wrapper">
                <div className="profile-card">
                    <div className="profile-header">
                        <h1>👤 Профиль пользователя</h1>
                        <button onClick={handleLogout} className="logout-button">
                            🚪 Выйти
                        </button>
                    </div>

                    <div className="profile-content">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} className="profile-avatar" />
                                ) : (
                                    <div className="profile-avatar-placeholder">{getInitials(user.username)}</div>
                                )}

                                <label htmlFor="avatar-upload" className="avatar-upload-label">
                                    📷 Изменить
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>

                            <div className="user-info">
                                <h2>{user.username}</h2>
                                <p className="user-id">ID: {user.id}</p>
                                <p className="join-date">
                                    Присоединился: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                        </div>

                        <div className="stats-section">
                            <div className="stat-card">
                                <div className="stat-icon">📚</div>
                                <div className="stat-info">
                                    <h3>{articles.length}</h3>
                                    <p>Обработано статей</p>
                                </div>
                            </div>
                        </div>

                        <div className="articles-section">
                            <h3>📄 История обработки</h3>

                            {loadingArticles ? (
                                <div className="loading-articles">
                                    <div className="spinner"></div>
                                    <p>Загрузка статей...</p>
                                </div>
                            ) : articles.length > 0 ? (
                                <div className="articles-list">
                                    {articles.map((article) => (
                                        <div
                                            key={article.id}
                                            className="article-item"
                                            onClick={() => handleArticleClick(article)}
                                        >
                                            <div className="article-icon">📝</div>
                                            <div className="article-details">
                                                <h4>Статья #{article.id}</h4>
                                                <div className="article-meta">
                                                    <span>🏷️ {getFirstKeyword(article.keywords)}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(article.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="article-status">
                                                <span className="status-badge">✅ Готова</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-articles">
                                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    <p>Вы еще не обработали ни одной статьи</p>
                                    <button onClick={() => navigate('/')} className="go-home-button">
                                        🏠 На главную
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* КНОПКА НА ГЛАВНУЮ ВНИЗУ */}
                        <div className="profile-footer">
                            <button onClick={() => navigate('/')} className="back-to-home-button">
                                🏠 Вернуться на главную страницу
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedArticle && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>✕</button>

                        <h2 className="modal-title">📄 Статья #{selectedArticle.id}</h2>

                        {articleDetails ? (
                            <div className="modal-body">
                                <div className="modal-section">
                                    <h3>📋 Рубрика</h3>
                                    <div className="section-text">{formatRubric(articleDetails.rubric)}</div>
                                </div>

                                <div className="modal-section">
                                    <h3>🏷️ Ключевые слова</h3>
                                    <div className="section-text">{formatKeywords(articleDetails.keywords)}</div>
                                </div>

                                <div className="modal-section">
                                    <h3>📝 Краткое содержание</h3>
                                    <div className="section-text scrollable">{articleDetails.summary || 'Отсутствует'}</div>
                                </div>

                                <div className="modal-section">
                                    <h3>📄 Нормализованный текст</h3>
                                    <div className="section-text scrollable">{articleDetails.normalized_text || 'Отсутствует'}</div>
                                </div>

                                <div className="modal-footer">
                                    <small>📅 Обработано: {formatDate(articleDetails.created_at)}</small>
                                </div>
                            </div>
                        ) : (
                            <div className="modal-loading">
                                <div className="spinner"></div>
                                <p>Загрузка деталей...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
