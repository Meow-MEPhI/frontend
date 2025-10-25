import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);

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
        return username
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="profile-container">
            <div className="profile-wrapper">
                <div className="profile-card">
                    <div className="profile-header">
                        <h1>Профиль пользователя</h1>
                        <button onClick={handleLogout} className="logout-button">
                            Выйти
                        </button>
                    </div>

                    <div className="profile-content">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Аватар" className="profile-avatar" />
                                ) : (
                                    <div className="profile-avatar-placeholder">
                                        {getInitials(user.username)}
                                    </div>
                                )}
                                <label htmlFor="avatar-upload" className="avatar-upload-label">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                    Изменить фото
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    style={{ display: 'none' }}
                                />
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
                                <div className="stat-icon">📄</div>
                                <div className="stat-info">
                                    <h3>{user.processedArticles?.length || 0}</h3>
                                    <p>Обработано статей</p>
                                </div>
                            </div>
                        </div>

                        <div className="articles-section">
                            <h3>Обработанные статьи</h3>
                            {user.processedArticles && user.processedArticles.length > 0 ? (
                                <div className="articles-list">
                                    {user.processedArticles.map((article) => (
                                        <div key={article.id} className="article-item">
                                            <div className="article-icon">📑</div>
                                            <div className="article-details">
                                                <h4>{article.name}</h4>
                                                <p className="article-meta">
                                                    <span>{(article.size / 1024).toFixed(2)} KB</span>
                                                    <span>•</span>
                                                    <span>{new Date(article.processedAt).toLocaleDateString('ru-RU')}</span>
                                                </p>
                                            </div>
                                            <div className="article-status">
                                                <span className="status-badge">{article.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-articles">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14,2 14,8 20,8" />
                                    </svg>
                                    <p>Вы еще не обработали ни одной статьи</p>
                                    <button onClick={() => navigate('/')} className="go-home-button">
                                        Загрузить статью
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
