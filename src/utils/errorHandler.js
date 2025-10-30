/**
 * Handler global de erros para evitar problemas com extensões do navegador
 * e outros listeners assíncronos
 */

// Handler para erros não capturados
window.addEventListener('error', (event) => {
    // Verificar se é o erro específico de message channel
    if (event.error && event.error.message &&
        event.error.message.includes('message channel closed')) {
        console.warn('[SYSTEM] Erro de message channel ignorado (provavelmente de extensão do navegador)');
        event.preventDefault(); // Prevenir que o erro apareça no console
        return false;
    }
});

// Handler para promises rejeitadas
window.addEventListener('unhandledrejection', (event) => {
    // Verificar se é o erro específico de message channel
    if (event.reason && event.reason.message &&
        event.reason.message.includes('message channel closed')) {
        console.warn('[SYSTEM] Promise rejeitada ignorada (provavelmente de extensão do navegador)');
        event.preventDefault(); // Prevenir que o erro apareça no console
        return false;
    }
});

// Handler específico para erros de listeners assíncronos
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (type, listener, options) {
    // Wrapper para capturar erros em listeners
    const wrappedListener = function (event) {
        try {
            if (typeof listener === 'function') {
                return listener.call(this, event);
            }
        } catch (error) {
            // Se for erro de message channel, ignorar
            if (error.message && error.message.includes('message channel closed')) {
                console.warn('[SYSTEM] Erro de listener ignorado:', error.message);
                return;
            }
            // Para outros erros, re-lançar
            throw error;
        }
    };

    return originalAddEventListener.call(this, type, wrappedListener, options);
};

export default {};





