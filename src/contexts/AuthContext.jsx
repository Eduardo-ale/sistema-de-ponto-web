import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });

    // Aplicar tema
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Função para alternar tema
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Verificar autenticação inicial
    useEffect(() => {
        const token = localStorage.getItem('token');
        const sessionData = localStorage.getItem('sessionData');

        if (token && sessionData) {
            try {
                const parsedSession = JSON.parse(sessionData);
                setIsAuthenticated(true);
                setUser(parsedSession);
            } catch (error) {
                console.error('Erro ao restaurar sessão:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('sessionData');
                localStorage.removeItem('sessionId');
            }
        }
        setLoading(false);
    }, []);

    // Função de login simplificada
    const login = async (credentials) => {
        try {
            // Simular autenticação
            const mockUsers = [
                { id: 1, email: 'admin@sistema.com', password: 'admin123', name: 'Administrador', role: 'admin' },
                { id: 2, email: 'colaborador@sistema.com', password: 'colab123', name: 'Colaborador', role: 'colaborador' },
                { id: 3, email: 'rh@sistema.com', password: 'rh123', name: 'RH', role: 'rh' }
            ];

            const user = mockUsers.find(u =>
                u.email === credentials.email && u.password === credentials.password
            );

            if (user) {
                const sessionData = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    loginTime: new Date().toISOString(),
                    lastActivity: Date.now()
                };

                const token = btoa(JSON.stringify(sessionData));

                localStorage.setItem('token', token);
                localStorage.setItem('sessionData', JSON.stringify(sessionData));
                localStorage.setItem('sessionId', `session_${Date.now()}`);

                setIsAuthenticated(true);
                setUser(sessionData);

                return { success: true, user: sessionData };
            } else {
                return { success: false, error: 'Credenciais inválidas' };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: 'Erro interno' };
        }
    };

    // Função para verificar se usuário está ativo
    const isUserActive = (status) => {
        return status === true || status === 'ativo' || status === 'Ativo' || status === 'active';
    };

    // Função de logout simplificada
    const logout = async (reason = 'manual') => {
        localStorage.removeItem('token');
        localStorage.removeItem('sessionData');
        localStorage.removeItem('sessionId');

        setIsAuthenticated(false);
        setUser(null);
    };

    // Verificar status do usuário periodicamente
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const checkInterval = setInterval(() => {
            try {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const currentUser = users.find(u => u.id === user.id);

                if (currentUser && !isUserActive(currentUser.status)) {
                    logout();
                    toast.error('Sua conta foi desativada. Você foi desconectado.');
                }
            } catch (error) {
                console.error('Erro ao verificar status do usuário:', error);
            }
        }, 5000); // Verifica a cada 5 segundos

        return () => clearInterval(checkInterval);
    }, [isAuthenticated, user]);

    // Verificar se usuário tem permissão
    const hasPermission = (requiredRole) => {
        if (!user) return false;

        // Admin tem acesso a tudo
        if (user.role === 'admin') return true;

        // Verificar role específico
        if (Array.isArray(requiredRole)) {
            return requiredRole.includes(user.role);
        }

        return user.role === requiredRole;
    };

    // Verificar se usuário é admin
    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        hasPermission,
        isAdmin,
        theme,
        toggleTheme
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;