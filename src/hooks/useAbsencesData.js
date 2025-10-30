import { useState, useEffect, useCallback } from 'react';

export const useAbsencesData = (selectedDepartment = 'Todos') => {
    const [absencesToday, setAbsencesToday] = useState(0);
    const [weeklyData, setWeeklyData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Função para filtrar ausências por departamento
    const filterAbsencesByDepartment = useCallback((absences, department) => {
        if (department === 'Todos') {
            return absences;
        }

        // Mapeamento de departamentos para tipos de ausência
        const departmentMapping = {
            'Recursos Humanos': ['Folga', 'Afastamento'],
            'Tecnologia da Informação': ['Folga', 'Afastamento'],
            'Administração': ['Folga', 'Feriado'],
            'Financeiro': ['Folga', 'Afastamento'],
            'Comercial': ['Folga', 'Afastamento'],
            'Operações': ['Folga', 'Afastamento'],
            'Atendimento': ['Folga', 'Afastamento'],
            'Marketing': ['Folga', 'Afastamento'],
            'Jurídico': ['Folga', 'Afastamento']
        };

        const allowedTypes = departmentMapping[department] || ['Folga', 'Afastamento', 'Feriado'];
        return absences.filter(absence => allowedTypes.includes(absence.tipo));
    }, []);

    // Função para calcular ausências hoje
    const calculateAbsencesToday = useCallback(() => {
        try {
            const storedAbsences = JSON.parse(localStorage.getItem('absences') || '[]');
            const filteredAbsences = filterAbsencesByDepartment(storedAbsences, selectedDepartment);
            const today = new Date().toISOString().split('T')[0];

            const todayAbsences = filteredAbsences.filter(absence => {
                const startDate = new Date(absence.inicio);
                const endDate = new Date(absence.fim);
                const todayDate = new Date(today);

                return todayDate >= startDate && todayDate <= endDate && absence.status === 'Ativo';
            });

            return todayAbsences.length;
        } catch (error) {
            console.error('Erro ao calcular ausências hoje:', error);
            return 0;
        }
    }, [selectedDepartment, filterAbsencesByDepartment]);

    // Função para calcular dados semanais
    const calculateWeeklyData = useCallback(() => {
        try {
            const storedAbsences = JSON.parse(localStorage.getItem('absences') || '[]');
            const filteredAbsences = filterAbsencesByDepartment(storedAbsences, selectedDepartment);
            const today = new Date();
            const weeklyData = [];

            // Gerar últimos 7 dias
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                const dayAbsences = filteredAbsences.filter(absence => {
                    const startDate = new Date(absence.inicio);
                    const endDate = new Date(absence.fim);
                    const checkDate = new Date(dateStr);

                    return checkDate >= startDate && checkDate <= endDate && absence.status === 'Ativo';
                });

                const folgas = dayAbsences.filter(a => a.tipo === 'Folga').length;
                const afastamentos = dayAbsences.filter(a => a.tipo === 'Afastamento').length;
                const feriados = dayAbsences.filter(a => a.tipo === 'Feriado').length;
                const total = folgas + afastamentos + feriados;

                weeklyData.push({
                    dia: dateStr,
                    dataFormatada: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                    Total: total,
                    Folgas: folgas,
                    Afastamentos: afastamentos,
                    Feriados: feriados
                });
            }

            return weeklyData;
        } catch (error) {
            console.error('Erro ao calcular dados semanais:', error);
            return [];
        }
    }, [selectedDepartment, filterAbsencesByDepartment]);

    // Função para buscar dados
    const fetchData = useCallback(() => {
        setLoading(true);

        // Simular delay de API
        setTimeout(() => {
            const todayCount = calculateAbsencesToday();
            const weekly = calculateWeeklyData();

            setAbsencesToday(todayCount);
            setWeeklyData(weekly);
            setLoading(false);
        }, 500);
    }, [calculateAbsencesToday, calculateWeeklyData]);

    // Atualizar dados automaticamente
    useEffect(() => {
        fetchData();

        // Atualizar a cada 5 minutos
        const interval = setInterval(fetchData, 300000);

        return () => clearInterval(interval);
    }, [fetchData]);

    // Atualizar quando localStorage mudar
    useEffect(() => {
        const handleStorageChange = (e) => {
            // Verificar se o evento é válido e relacionado a ausências
            if (!e || !e.key || e.key !== 'absences') {
                return;
            }

            try {
                fetchData();
            } catch (error) {
                console.error('[ABSENCES] Erro ao processar mudanças de storage:', error);
            }
        };

        // Adicionar listener com tratamento de erro
        try {
            window.addEventListener('storage', handleStorageChange);
        } catch (error) {
            console.error('[ABSENCES] Erro ao adicionar listener de storage:', error);
        }

        return () => {
            try {
                window.removeEventListener('storage', handleStorageChange);
            } catch (error) {
                console.error('[ABSENCES] Erro ao remover listener de storage:', error);
            }
        };
    }, [fetchData]);

    return {
        absencesToday,
        weeklyData,
        loading,
        refreshData: fetchData
    };
};
