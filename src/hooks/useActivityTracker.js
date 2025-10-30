import { useEffect, useRef } from 'react';

export const useActivityTracker = (onInactive, hasSession = false) => {
    const timeoutRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    useEffect(() => {
        if (!hasSession) {
            return;
        }

        const resetTimeout = () => {
            lastActivityRef.current = Date.now();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                onInactive();
            }, 15 * 60 * 1000); // 15 minutos
        };

        const handleActivity = () => {
            resetTimeout();
        };

        // Eventos que indicam atividade do usuário
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        // Adicionar listeners
        events.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });

        // Iniciar o timeout
        resetTimeout();

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity, true);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [onInactive, hasSession]);
};






