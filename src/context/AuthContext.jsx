import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const register = (username, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.username === username);

        if (existingUser) {
            throw new Error('Пользователь с таким логином уже существует');
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            password,
            avatar: null,
            processedArticles: [],
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;

        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));

        return userWithoutPassword;
    };

    const login = (username, password) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find(
            u => u.username === username && u.password === password
        );

        if (!foundUser) {
            throw new Error('Неверный логин или пароль');
        }

        const userWithoutPassword = { ...foundUser };
        delete userWithoutPassword.password;

        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));

        return userWithoutPassword;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateProfile = (updates) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            localStorage.setItem('users', JSON.stringify(users));

            const updatedUser = { ...users[userIndex] };
            delete updatedUser.password;

            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const addProcessedArticle = (article) => {
        const newArticle = {
            id: Date.now().toString(),
            name: article.name,
            size: article.size,
            processedAt: new Date().toISOString(),
            status: 'Обработано'
        };

        const updatedArticles = [...(user.processedArticles || []), newArticle];
        updateProfile({ processedArticles: updatedArticles });
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        addProcessedArticle
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{ color: 'white', fontSize: '24px' }}>Загрузка...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
