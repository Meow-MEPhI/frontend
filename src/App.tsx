import React, {JSX, useState} from 'react';
import './App.css';
import logo from './logo.png';

function App(): JSX.Element {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
        } else {
            alert('Пожалуйста, выберите PDF файл');
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
        } else {
            alert('Пожалуйста, выберите PDF файл');
        }
    };

    // Функция для перехода на сайт МИФИ
    const handleLogoClick = () => {
        window.open('https://mephi.ru/', '_blank');
    };

    return (
        <div className="App">
            <header className="App-header">
                <div className="header-container">
                    <div className="logo-section" onClick={handleLogoClick}>
                        <img src={logo} className="App-logo" alt="Логотип НИЯУ МИФИ" />
                    </div>
                    <div className="title-section">
                        <h1 className="site-title">Сервис обработки научных статей</h1>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="upload-section">
                    <h2 className="upload-title">Загрузите статью на обработку</h2>
                    <p className="upload-subtitle">
                        Поддерживаются файлы в формате PDF размером до 10 МБ
                    </p>

                    <div
                        className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
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
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    className="file-input"
                                />
                                Выберите файл
                            </label>
                        </div>

                        {selectedFile && (
                            <div className="file-info">
                                <div className="file-details">
                                    <strong>Выбранный файл:</strong> {selectedFile.name}
                                </div>
                                <button className="process-button">
                                    Обработать статью
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="features-section">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Рубрицирование</h3>
                        <p>Автоматическое определение рубрик и категорий научной статьи</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🏷️</div>
                        <h3>Извлечение метаданных</h3>
                        <p>Извлечение и структурирование метаданных из научных публикаций</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📚</div>
                        <h3>Индексирование</h3>
                        <p>Создание индексов для быстрого поиска и навигации по материалу</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
