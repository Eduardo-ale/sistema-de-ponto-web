import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { auditService } from '../services/api';
import SessionWarningModal from '../components/modals/SessionWarningModal';
import { useActivityTracker } from '../hooks/useActivityTracker';

// Context para gerenciar sessões
const SessionContext = createContext();

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession deve ser usado dentro de SessionProvider');
    }
    return context;
};

// Configurações de sessão
const SESSION_CONFIG = {
    WARNING_TIME: 2 * 60 * 1000, // 2 minutos antes de expirar
    EXPIRY_TIME: 15 * 60 * 1000, // 15 minutos de inatividade
    CHECK_INTERVAL: 30 * 1000, // Verificar a cada 30 segundos
};

// Função para obter IP do cliente (simulada)
const getClientIP = async () => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return '127.0.0.1'; // IP local para desenvolvimento
    }
};

// Provider principal
export const SessionProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    // Verificar sessão existente
    useEffect(() => {
        const token = localStorage.getItem('token');
        const sessionData = localStorage.getItem('sessionData');

        if (token && sessionData) {
            try {
                const parsedSession = JSON.parse(sessionData);

                // Verificar se a sessão não expirou (opcional)
                const sessionTime = parsedSession.loginTime ? new Date(parsedSession.loginTime) : null;
                const now = new Date();
                const sessionAge = sessionTime ? now - sessionTime : 0;

                // Se a sessão for muito antiga (mais de 8 horas), não restaurar
                if (sessionAge > 8 * 60 * 60 * 1000) {
                    console.log('Sessão expirada, removendo dados');
                    localStorage.removeItem('token');
                    localStorage.removeItem('sessionData');
                    localStorage.removeItem('sessionId');
                    return;
                }

                // Por padrão, não restaurar sessão automaticamente
                // Comentar a linha abaixo para desabilitar restauração automática
                // setSession(parsedSession);

                // Registrar tentativa de restauração
                auditService.logEvent({
                    type: 'session_restore_attempt',
                    userId: parsedSession.id,
                    userEmail: parsedSession.email,
                    userName: parsedSession.name,
                    details: 'Tentativa de restauração de sessão (desabilitada)'
                });
            } catch (error) {
                console.error('Erro ao restaurar sessão:', error);
                logout();
            }
        }
    }, []);

    // Callback para quando usuário fica inativo
    const handleInactive = useCallback(() => {
        if (session && !showWarningModal) {
            setShowWarningModal(true);
            setTimeLeft(SESSION_CONFIG.WARNING_TIME);

            // Registrar aviso de expiração
            auditService.logEvent({
                type: 'session_warning',
                userId: session.id,
                userEmail: session.email,
                userName: session.name,
                details: 'Aviso de expiração de sessão exibido'
            });
        }
    }, [session, showWarningModal]);

    // Hook para rastrear atividade - só funciona quando há sessão
    useActivityTracker(handleInactive, !!session);

    // Timer para contagem regressiva
    useEffect(() => {
        if (showWarningModal && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1000);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (showWarningModal && timeLeft <= 0) {
            handleSessionExpired();
        }
    }, [showWarningModal, timeLeft]);

    // Função de login
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

                const token = btoa(JSON.stringify(sessionData)); // Simulação de JWT

                localStorage.setItem('token', token);
                localStorage.setItem('sessionData', JSON.stringify(sessionData));
                localStorage.setItem('sessionId', `session_${Date.now()}`);

                setSession(sessionData);

                // Registrar login bem-sucedido
                await auditService.logEvent({
                    type: 'login_success',
                    userId: user.id,
                    userEmail: user.email,
                    userName: user.name,
                    details: 'Login realizado com sucesso'
                });

                toast.success(`Bem-vindo, ${user.name}!`);
                return { success: true, user: sessionData };
            } else {
                // Registrar tentativa de login falhada
                await auditService.logEvent({
                    type: 'login_failed',
                    userEmail: credentials.email,
                    details: 'Tentativa de login com credenciais inválidas'
                });

                toast.error('Credenciais inválidas');
                return { success: false, error: 'Credenciais inválidas' };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            toast.error('Erro interno do servidor');
            return { success: false, error: 'Erro interno' };
        }
    };

    // Função de logout
    const logout = async (reason = 'manual') => {
        if (session) {
            // Registrar logout
            await auditService.logEvent({
                type: 'logout',
                userId: session.id,
                userEmail: session.email,
                userName: session.name,
                details: `Logout ${reason === 'manual' ? 'manual' : 'por expiração'}`
            });
        }

        localStorage.removeItem('token');
        localStorage.removeItem('sessionData');
        localStorage.removeItem('sessionId');

        setSession(null);
        setShowWarningModal(false);
        setIsSessionExpired(false);

        if (reason === 'expired') {
            toast.error('Sua sessão expirou por inatividade. Faça login novamente.');
        }
    };

    // Renovar sessão
    const renewSession = async () => {
        if (session) {
            const updatedSession = {
                ...session,
                lastActivity: Date.now()
            };

            localStorage.setItem('sessionData', JSON.stringify(updatedSession));
            setSession(updatedSession);
            setShowWarningModal(false);

            // Registrar renovação de sessão
            await auditService.logEvent({
                type: 'session_renewed',
                userId: session.id,
                userEmail: session.email,
                userName: session.name,
                details: 'Sessão renovada pelo usuário'
            });

            toast.success('Sessão renovada com sucesso!');
        }
    };

    // Lidar com expiração de sessão
    const handleSessionExpired = async () => {
        setShowWarningModal(false);
        setIsSessionExpired(true);
        await logout('expired');

        // Redirecionar após um breve delay
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    };

    // Formatar tempo restante
    const formatTimeLeft = (milliseconds) => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const value = {
        session,
        isSessionExpired,
        showWarningModal,
        timeLeft: formatTimeLeft(timeLeft),
        login,
        logout,
        renewSession,
        handleSessionExpired
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
            {/* Modal de aviso de expiração */}
            <SessionWarningModal
                isOpen={showWarningModal}
                timeLeft={timeLeft}
                onContinue={renewSession}
                onLogout={() => logout('manual')}
            />
        </SessionContext.Provider>
    );
};

export default SessionProvider;
