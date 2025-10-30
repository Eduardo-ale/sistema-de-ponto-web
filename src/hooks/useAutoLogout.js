import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSystemConfig } from '../config/systemConfig';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar logout automático por inatividade
 * Monitora atividade do usuário e executa logout após período de inatividade
 */
export const useAutoLogout = (customTimeoutMinutes = null) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    // Configurações do sistema
    const config = getSystemConfig();

    // Verificar configurações de segurança salvas
    const getSecuritySettings = () => {
        try {
            const savedSettings = localStorage.getItem('securitySettings');
            return savedSettings ? JSON.parse(savedSettings) : {};
        } catch (error) {
            console.error('Erro ao carregar configurações de segurança:', error);
            return {};
        }
    };

    const securitySettings = getSecuritySettings();
    const sessionSettings = securitySettings.sessionSettings || {};

    // Usar configurações de segurança se disponíveis, senão usar configurações padrão
    const timeoutMinutes = customTimeoutMinutes || sessionSettings.timeoutMinutes || config.sessionTimeoutMinutes;
    const warningMinutes = config.warningBeforeLogout;
    const logoutOnInactivity = sessionSettings.logoutOnInactivity === true; // Só true se explicitamente definido como true

    // Estados
    const [showWarning, setShowWarning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(warningMinutes * 60);
    const [isExtending, setIsExtending] = useState(false);

    // Refs para timers
    const warningTimerRef = useRef(null);
    const logoutTimerRef = useRef(null);
    const warningCountdownRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    // Função para limpar todos os timers
    const clearAllTimers = useCallback(() => {
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
        }
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
            logoutTimerRef.current = null;
        }
        if (warningCountdownRef.current) {
            clearInterval(warningCountdownRef.current);
            warningCountdownRef.current = null;
        }
    }, []);

    // Função para executar logout automático
    const handleAutoLogout = useCallback(async () => {
        try {
            // Log do evento (se habilitado)
            if (config.logLogoutEvents) {
                console.log(`[AUTO LOGOUT] Usuário ${user?.name || 'Desconhecido'} - Logout por inatividade às ${new Date().toLocaleString()}`);
            }

            // Toast de informação
            toast.error('Sessão encerrada por inatividade', {
                duration: 4000,
                icon: '⏰'
            });

            // Executar logout
            await logout();

            // Redirecionar para login
            navigate('/login', { replace: true });

        } catch (error) {
            console.error('Erro durante logout automático:', error);
            // Mesmo com erro, redirecionar para login
            navigate('/login', { replace: true });
        }
    }, [logout, navigate, user, config.logLogoutEvents]);

    // Função para estender sessão
    const handleExtendSession = useCallback(() => {
        setIsExtending(true);

        // Toast de confirmação
        toast.success('Sessão estendida com sucesso!', {
            duration: 3000,
            icon: '✅'
        });

        // Fechar modal de aviso
        setShowWarning(false);

        // Resetar timers
        clearAllTimers();
        resetTimers();

        // Atualizar última atividade
        lastActivityRef.current = Date.now();

        // Resetar estado
        setTimeout(() => {
            setIsExtending(false);
        }, 1000);
    }, [clearAllTimers]);

    // Função para executar logout manual do modal
    const handleManualLogout = useCallback(async () => {
        setShowWarning(false);
        clearAllTimers();
        await handleAutoLogout();
    }, [handleAutoLogout, clearAllTimers]);

    // Função para resetar timers
    const resetTimers = useCallback(() => {
        // Limpar timers existentes
        clearAllTimers();

        // Timer para mostrar aviso
        const warningTimeoutMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setTimeRemaining(warningMinutes * 60);

            // Iniciar countdown do aviso
            warningCountdownRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(warningCountdownRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Timer para logout automático após aviso
            logoutTimerRef.current = setTimeout(() => {
                handleAutoLogout();
            }, warningMinutes * 60 * 1000);

        }, warningTimeoutMs);

        // Atualizar última atividade
        lastActivityRef.current = Date.now();

    }, [timeoutMinutes, warningMinutes, handleAutoLogout]);

    // Função para detectar atividade
    const handleActivity = useCallback(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;

        // Só resetar se passou tempo suficiente (evitar spam)
        if (timeSinceLastActivity > 1000) { // 1 segundo
            resetTimers();
        }
    }, [resetTimers]);

    // Função para fechar modal de aviso
    const handleCloseWarning = useCallback(() => {
        setShowWarning(false);
        clearAllTimers();
        resetTimers();
    }, [clearAllTimers, resetTimers]);

    // Configurar listeners de atividade
    useEffect(() => {
        // Verificar se logout por inatividade está habilitado
        if (!config.enableAutoLogout || !logoutOnInactivity) {
            console.log('[AUTO LOGOUT] Logout por inatividade desabilitado');
            return;
        }

        // Adicionar listeners para eventos de atividade
        config.activityEvents.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // Iniciar timers
        resetTimers();

        // Cleanup
        return () => {
            config.activityEvents.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            clearAllTimers();
        };
    }, [config.enableAutoLogout, config.activityEvents, handleActivity, resetTimers, clearAllTimers, logoutOnInactivity]);

    // Debug mode
    useEffect(() => {
        if (config.debugMode) {
            console.log(`[AUTO LOGOUT] Configurado para ${timeoutMinutes} minutos de inatividade`);
            console.log(`[AUTO LOGOUT] Aviso será exibido ${warningMinutes} minutos antes do logout`);
            console.log(`[AUTO LOGOUT] Logout por inatividade: ${logoutOnInactivity ? 'HABILITADO' : 'DESABILITADO'}`);
            console.log(`[AUTO LOGOUT] Configurações de segurança carregadas:`, securitySettings);
            console.log(`[AUTO LOGOUT] Configurações de sessão:`, sessionSettings);
        }
    }, [config.debugMode, timeoutMinutes, warningMinutes, logoutOnInactivity, securitySettings, sessionSettings]);

    // Listener para mudanças nas configurações de segurança
    useEffect(() => {
        const handleStorageChange = (e) => {
            // Verificar se o evento é válido e relacionado às configurações de segurança
            if (!e || !e.key || e.key !== 'securitySettings') {
                return;
            }

            try {
                // Recarregar configurações quando elas mudarem
                const newSettings = e.newValue ? JSON.parse(e.newValue) : {};
                const newSessionSettings = newSettings.sessionSettings || {};
                const newLogoutOnInactivity = newSessionSettings.logoutOnInactivity === true;

                if (config.debugMode) {
                    console.log('[AUTO LOGOUT] Configurações de segurança atualizadas');
                    console.log(`[AUTO LOGOUT] Logout por inatividade: ${newLogoutOnInactivity ? 'HABILITADO' : 'DESABILITADO'}`);
                }

                // Se logout foi desabilitado, limpar timers
                if (!newLogoutOnInactivity) {
                    clearAllTimers();
                    setShowWarning(false);
                }
            } catch (error) {
                console.error('[AUTO LOGOUT] Erro ao processar mudanças de configuração:', error);
            }
        };

        // Adicionar listener com tratamento de erro
        try {
            window.addEventListener('storage', handleStorageChange);
        } catch (error) {
            console.error('[AUTO LOGOUT] Erro ao adicionar listener de storage:', error);
        }

        return () => {
            try {
                window.removeEventListener('storage', handleStorageChange);
            } catch (error) {
                console.error('[AUTO LOGOUT] Erro ao remover listener de storage:', error);
            }
        };
    }, [config.debugMode, clearAllTimers]);

    // Retornar estados e funções para o componente
    return {
        showWarning,
        timeRemaining,
        isExtending,
        handleExtendSession,
        handleManualLogout,
        handleCloseWarning,
        resetTimers,
        lastActivity: lastActivityRef.current
    };
};

export default useAutoLogout;
