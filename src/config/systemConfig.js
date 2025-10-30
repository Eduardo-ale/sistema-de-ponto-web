/**
 * Configurações globais do sistema CORE RH
 * Centraliza todas as configurações de timeout, segurança e comportamento
 */

export const SYSTEM_CONFIG = {
    // Configurações de sessão e timeout
    sessionTimeoutMinutes: 15,        // Tempo total de inatividade antes do logout
    warningBeforeLogout: 1,           // Minutos antes do logout para exibir aviso
    warningDurationSeconds: 60,       // Duração do aviso em segundos

    // Configurações de atividade
    activityEvents: [
        'mousemove',
        'keydown',
        'keyup',
        'scroll',
        'click',
        'touchstart',
        'touchmove',
        'focus',
        'blur'
    ],

    // Configurações de notificação
    notificationDuration: 5000,       // Duração das notificações em ms
    warningNotificationDuration: 10000, // Duração do aviso de sessão em ms

    // Configurações de segurança
    clearDataOnLogout: true,          // Limpar todos os dados locais no logout
    logLogoutEvents: true,             // Registrar eventos de logout

    // Configurações de UI
    enableSessionWarning: true,       // Habilitar aviso de sessão
    enableAutoLogout: true,           // Habilitar logout automático
    showSessionTimer: false,          // Mostrar timer de sessão na UI

    // Configurações de desenvolvimento
    debugMode: false,                 // Modo debug para logs detalhados
    testMode: false                   // Modo de teste com timeouts reduzidos
};

// Configurações específicas para desenvolvimento/teste
export const DEV_CONFIG = {
    sessionTimeoutMinutes: 2,         // 2 minutos para testes
    warningBeforeLogout: 0.5,         // 30 segundos de aviso
    debugMode: true,
    testMode: true
};

// Função para obter configuração baseada no ambiente
export const getSystemConfig = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment ? { ...SYSTEM_CONFIG, ...DEV_CONFIG } : SYSTEM_CONFIG;
};

export default SYSTEM_CONFIG;
