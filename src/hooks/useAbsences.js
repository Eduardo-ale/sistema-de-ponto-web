import { useState, useEffect, useCallback } from 'react';

const useAbsences = () => {
    const [absences, setAbsences] = useState([]);
    const [loading, setLoading] = useState(false);

    // Carregar todas as ausências
    const loadAbsences = useCallback(() => {
        try {
            const storedAbsences = JSON.parse(localStorage.getItem('absences') || '[]');
            setAbsences(storedAbsences);
            return storedAbsences;
        } catch (error) {
            console.error('Erro ao carregar ausências:', error);
            setAbsences([]);
            return [];
        }
    }, []);

    // Carregar ausências de um usuário específico
    const getUserAbsences = useCallback((userId) => {
        try {
            const storedAbsences = JSON.parse(localStorage.getItem('absences') || '[]');
            return storedAbsences.filter(absence => absence.userId === userId);
        } catch (error) {
            console.error('Erro ao carregar ausências do usuário:', error);
            return [];
        }
    }, []);

    // Verificar se uma data está em uma ausência
    const isDateInAbsence = useCallback((userId, date) => {
        try {
            const userAbsences = getUserAbsences(userId);
            const checkDate = new Date(date);

            return userAbsences.some(absence => {
                const startDate = new Date(absence.inicio);
                const endDate = new Date(absence.fim);

                return checkDate >= startDate && checkDate <= endDate && absence.status === 'Ativo';
            });
        } catch (error) {
            console.error('Erro ao verificar ausência:', error);
            return false;
        }
    }, [getUserAbsences]);

    // Obter tipo de ausência para uma data
    const getAbsenceTypeForDate = useCallback((userId, date) => {
        try {
            const userAbsences = getUserAbsences(userId);
            const checkDate = new Date(date);

            const absence = userAbsences.find(absence => {
                const startDate = new Date(absence.inicio);
                const endDate = new Date(absence.fim);

                return checkDate >= startDate && checkDate <= endDate && absence.status === 'Ativo';
            });

            return absence ? absence.tipo : null;
        } catch (error) {
            console.error('Erro ao obter tipo de ausência:', error);
            return null;
        }
    }, [getUserAbsences]);

    // Calcular dias de ausência em um período
    const calculateAbsenceDays = useCallback((userId, startDate, endDate) => {
        try {
            const userAbsences = getUserAbsences(userId);
            const start = new Date(startDate);
            const end = new Date(endDate);
            let absenceDays = 0;

            userAbsences.forEach(absence => {
                if (absence.status === 'Ativo') {
                    const absenceStart = new Date(absence.inicio);
                    const absenceEnd = new Date(absence.fim);

                    // Calcular interseção entre períodos
                    const overlapStart = new Date(Math.max(start.getTime(), absenceStart.getTime()));
                    const overlapEnd = new Date(Math.min(end.getTime(), absenceEnd.getTime()));

                    if (overlapStart <= overlapEnd) {
                        const diffTime = Math.abs(overlapEnd - overlapStart);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        absenceDays += diffDays;
                    }
                }
            });

            return absenceDays;
        } catch (error) {
            console.error('Erro ao calcular dias de ausência:', error);
            return 0;
        }
    }, [getUserAbsences]);

    // Obter estatísticas de ausências
    const getAbsenceStats = useCallback((userId) => {
        try {
            const userAbsences = getUserAbsences(userId);
            const activeAbsences = userAbsences.filter(absence => absence.status === 'Ativo');

            const stats = {
                total: userAbsences.length,
                active: activeAbsences.length,
                byType: {},
                totalDays: 0
            };

            // Contar por tipo
            userAbsences.forEach(absence => {
                stats.byType[absence.tipo] = (stats.byType[absence.tipo] || 0) + 1;

                // Calcular dias totais
                if (absence.status === 'Ativo') {
                    const start = new Date(absence.inicio);
                    const end = new Date(absence.fim);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    stats.totalDays += diffDays;
                }
            });

            return stats;
        } catch (error) {
            console.error('Erro ao obter estatísticas de ausências:', error);
            return {
                total: 0,
                active: 0,
                byType: {},
                totalDays: 0
            };
        }
    }, [getUserAbsences]);

    // Atualizar status de ausências (marcar como concluídas se passaram da data)
    const updateAbsenceStatuses = useCallback(() => {
        try {
            const storedAbsences = JSON.parse(localStorage.getItem('absences') || '[]');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let updated = false;
            const updatedAbsences = storedAbsences.map(absence => {
                if (absence.status === 'Ativo') {
                    const endDate = new Date(absence.fim);
                    endDate.setHours(23, 59, 59, 999);

                    if (today > endDate) {
                        updated = true;
                        return {
                            ...absence,
                            status: 'Concluído',
                            updatedAt: new Date().toISOString()
                        };
                    }
                }
                return absence;
            });

            if (updated) {
                localStorage.setItem('absences', JSON.stringify(updatedAbsences));
                setAbsences(updatedAbsences);
            }

            return updatedAbsences;
        } catch (error) {
            console.error('Erro ao atualizar status das ausências:', error);
            return [];
        }
    }, []);

    // Carregar ausências na inicialização
    useEffect(() => {
        loadAbsences();
        updateAbsenceStatuses();
    }, [loadAbsences, updateAbsenceStatuses]);

    return {
        absences,
        loading,
        actions: {
            loadAbsences,
            getUserAbsences,
            isDateInAbsence,
            getAbsenceTypeForDate,
            calculateAbsenceDays,
            getAbsenceStats,
            updateAbsenceStatuses
        }
    };
};

export default useAbsences;
