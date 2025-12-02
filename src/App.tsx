import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './App.css';
import logo from './logo.png';

// Главная страница с загрузкой файлов
function HomePage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');

    const authContext = useAuth();
    const user = (authContext as any)?.user;
    const addProcessedArticle = (authContext as any)?.addProcessedArticle;

    // Функция выбора файла
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        // Проверяем тип файла (PDF или TXT)
        if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
            setSelectedFile(file);
            setProcessingStatus('');
        } else {
            alert('Пожалуйста, выберите PDF или TXT файл');
        }
    };

    // Обработка drag over
    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    // Обработка drag leave
    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    // Обработка drop файла
    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files[0];

        // Проверяем тип файла (PDF или TXT)
        if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
            setSelectedFile(file);
            setProcessingStatus('');
        } else {
            alert('Пожалуйста, выберите PDF или TXT файл');
        }
    };

    // Главная функция обработки файла
    const handleProcess = async () => {
        if (selectedFile && addProcessedArticle) {
            try {
                setIsProcessing(true);
                setProcessingStatus('Подготовка файла...');

                // Если это TXT файл - сохраняем локально
                if (selectedFile.type === 'text/plain') {
                    const fileContent = await selectedFile.text();

                    const fileData = {
                        name: selectedFile.name,
                        content: fileContent,
                        savedAt: new Date().toISOString(),
                        type: 'txt'
                    };

                    // Сохраняем в localStorage
                    localStorage.setItem(`txt_file_${Date.now()}`, JSON.stringify(fileData));
                    console.log('✅ TXT файл сохранён в localStorage');
                }

                // Отправляем файл на обработку
                const formData = new FormData();
                formData.append('pdf', selectedFile);

                console.log('🚀 Отправка файла на сервер:', selectedFile.name);
                setProcessingStatus('Отправка на сервер...');

                const response = await fetch('http://localhost:5001/process_article', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();

                    console.log('✅ Получены результаты:', result);
                    setProcessingStatus('Обработка завершена!');

                    // Добавляем в профиль
                    addProcessedArticle(selectedFile);

                    // Сохраняем полные результаты в localStorage
                    localStorage.setItem(
                        `results_${Date.now()}`,
                        JSON.stringify({
                            filename: result.filename,
                            fileType: result.file_type,
                            timestamp: new Date().toISOString(),
                            results: result.results,
                            metadata: result.metadata
                        })
                    );

                    // Формируем красивое сообщение с результатами
                    let resultsMessage = `✅ СТАТЬЯ УСПЕШНО ОБРАБОТАНА!\n\n`;
                    resultsMessage += `📄 Файл: ${result.filename}\n`;
                    resultsMessage += `⏱️  Время обработки: ${result.processing_time}\n\n`;
                    resultsMessage += `════════════════════════════════\n\n`;

                    // Рубрицирование
                    if (result.results.rubrics) {
                        resultsMessage += `📚 РУБРИЦИРОВАНИЕ:\n`;
                        resultsMessage += `${result.results.rubrics.substring(0, 500)}...\n\n`;
                    }

                    // Ключевые слова
                    if (result.results.keywords) {
                        resultsMessage += `🔑 КЛЮЧЕВЫЕ СЛОВА:\n`;
                        resultsMessage += `${result.results.keywords.substring(0, 300)}...\n\n`;
                    }

                    // Резюме
                    if (result.results.summary) {
                        resultsMessage += `📖 РЕЗЮМЕ:\n`;
                        resultsMessage += `${result.results.summary.substring(0, 300)}...\n\n`;
                    }

                    // Нормализация
                    if (result.results.normalization) {
                        resultsMessage += `✨ НОРМАЛИЗАЦИЯ:\n`;
                        resultsMessage += `${result.results.normalization.substring(0, 300)}...\n\n`;
                    }

                    resultsMessage += `════════════════════════════════\n`;
                    resultsMessage += `✨ Все результаты сохранены в вашем профиле!`;

                    alert(resultsMessage);

                    setSelectedFile(null);
                    setProcessingStatus('');
                } else {
                    const error = await response.json();
                    alert(`❌ Ошибка обработки:\n${error.message}`);
                    setProcessingStatus('Ошибка при обработке');
                }
            } catch (error) {
                console.error('❌ Ошибка отправки файла:', error);
                alert(`❌ Ошибка отправки файла:\n${error}`);
                setProcessingStatus('Ошибка подключения к серверу');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Клик по логотипу
    const handleLogoClick = () => {
        window.open('https://mephi.ru/', '_blank');
    };

    return (
        <div className="App">
            {/* HEADER */}
            <header className="App-header">
                <div className="header-container">
                    <div className="logo-section" onClick={handleLogoClick}>
                        <img src={logo} className="App-logo" alt="Логотип НИЯУ МИФИ" />
                    </div>
                    <div className="title-section">
                        <h1 className="site-title">Сервис обработки научных статей</h1>
                    </div>
                    {user && (
                        <div className="user-menu">
                            <Link to="/profile" className="profile-link">
                                {(user as any).avatar ? (
                                    <img src={(user as any).avatar} alt="Avatar" className="header-avatar" />
                                ) : (
                                    <div className="header-avatar-placeholder">
                                        {(user as any).username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <span>{(user as any).username || 'Пользователь'}</span>
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="main-content">
                {/* UPLOAD SECTION */}
                <div className="upload-section">
                    <h2 className="upload-title">Загрузите научную статью на обработку</h2>
                    <p className="upload-subtitle">
                        Поддерживаются файлы в формате PDF и TXT. Система автоматически выполнит рубрицирование,
                        извлечение ключевых слов, нормализацию и создание резюме.
                    </p>

                    {/* UPLOAD AREA */}
                    <div
                        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                    fill="currentColor"
                                />
                                <polyline points="14,2 14,8 20,8" fill="white"/>
                            </svg>
                        </div>

                        <div className="upload-content">
                            <h3>Перетащите файл сюда</h3>
                            <p>или</p>

                            <label className="upload-button">
                                <input
                                    type="file"
                                    accept=".pdf, .txt"
                                    onChange={handleFileSelect}
                                    className="file-input"
                                    disabled={isProcessing}
                                />
                                Выберите PDF или TXT
                            </label>
                        </div>

                        {/* FILE INFO & PROCESSING STATUS */}
                        {selectedFile && (
                            <div className="file-info">
                                <div className="file-details">
                                    <strong>📄 Выбранный файл:</strong> {selectedFile.name}
                                    <br />
                                    <small>Размер: {(selectedFile.size / 1024).toFixed(2)} KB</small>
                                </div>

                                {/* PROCESSING STATUS */}
                                {isProcessing && (
                                    <div className="processing-status">
                                        <div className="spinner"></div>
                                        <p>{processingStatus}</p>
                                        <small>Это может занять 1-3 минуты...</small>
                                    </div>
                                )}

                                {/* PROCESS BUTTON */}
                                <button
                                    className="process-button"
                                    onClick={handleProcess}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? '⏳ Обработка...' : '🚀 Обработать статью'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* FEATURES SECTION */}
                <div className="features-section">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Рубрицирование</h3>
                        <p>Автоматическое построение иерархической структуры статьи с логически соподчинёнными заголовками</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🔑</div>
                        <h3>Извлечение ключевых слов</h3>
                        <p>Выделение 10-15 наиболее релевантных ключевых терминов и фраз с оценкой значимости</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">✨</div>
                        <h3>Нормализация текста</h3>
                        <p>Приведение научного текста к стандартному формату с исправлением стилистических ошибок</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📖</div>
                        <h3>Автоматическое резюме</h3>
                        <p>Создание краткого резюме статьи, отражающего основные результаты и выводы</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Конструктивная критика</h3>
                        <p>Анализ качества рубрицирования с рекомендациями по улучшению структуры</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🏆</div>
                        <h3>Многоагентный анализ</h3>
                        <p>Система из 6+ специализированных агентов, каждый из которых фокусируется на своей задаче</p>
                    </div>
                </div>

                {/* INFO SECTION */}
                <div className="info-section">
                    <h2>📚 Как работает система?</h2>
                    <div className="info-content">
                        <div className="info-item">
                            <h4>1️⃣ Загрузите файл</h4>
                            <p>Поддерживаются PDF и TXT форматы. Текст будет автоматически извлечён из документа.</p>
                        </div>
                        <div className="info-item">
                            <h4>2️⃣ Обработка в системе</h4>
                            <p>Многоагентная система выполнит анализ: рубрицирование, экстракцию ключевых слов, нормализацию и создание резюме.</p>
                        </div>
                        <div className="info-item">
                            <h4>3️⃣ Получите результаты</h4>
                            <p>Все результаты сохранятся в вашем профиле и будут доступны для скачивания и дальнейшей работы.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Главный компонент App
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <HomePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
