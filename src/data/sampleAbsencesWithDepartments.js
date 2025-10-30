// Dados de exemplo para ausências com departamentos
const sampleAbsencesWithDepartments = [
    {
        id: 1,
        tipo: 'Folga',
        inicio: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ontem
        fim: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacao: 'Folga pessoal',
        status: 'Ativo',
        departamento: 'Recursos Humanos'
    },
    {
        id: 2,
        tipo: 'Afastamento',
        inicio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 dias atrás
        fim: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 dias no futuro
        observacao: 'Licença médica',
        status: 'Ativo',
        departamento: 'Tecnologia da Informação'
    },
    {
        id: 3,
        tipo: 'Feriado',
        inicio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias atrás
        fim: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacao: 'Feriado nacional',
        status: 'Ativo',
        departamento: 'Administração'
    },
    {
        id: 4,
        tipo: 'Folga',
        inicio: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 dias atrás
        fim: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacao: 'Folga compensatória',
        status: 'Ativo',
        departamento: 'Financeiro'
    },
    {
        id: 5,
        tipo: 'Afastamento',
        inicio: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 dias atrás
        fim: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 dia no futuro
        observacao: 'Licença maternidade',
        status: 'Ativo',
        departamento: 'Comercial'
    },
    {
        id: 6,
        tipo: 'Folga',
        inicio: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 dias atrás
        fim: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacao: 'Folga semanal',
        status: 'Ativo',
        departamento: 'Operações'
    },
    {
        id: 7,
        tipo: 'Afastamento',
        inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias atrás
        fim: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias no futuro
        observacao: 'Licença médica',
        status: 'Ativo',
        departamento: 'Atendimento'
    },
    {
        id: 8,
        tipo: 'Folga',
        inicio: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
        fim: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacao: 'Folga pessoal',
        status: 'Ativo',
        departamento: 'Marketing'
    },
    {
        id: 9,
        tipo: 'Feriado',
        inicio: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 dias no futuro
        fim: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacao: 'Feriado estadual',
        status: 'Ativo',
        departamento: 'Jurídico'
    },
    {
        id: 10,
        tipo: 'Afastamento',
        inicio: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias no futuro
        fim: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 dias no futuro
        observacao: 'Licença médica',
        status: 'Ativo',
        departamento: 'Recursos Humanos'
    }
];

// Função para inicializar dados de exemplo com departamentos
export const initializeSampleAbsencesWithDepartments = () => {
    const existingAbsences = localStorage.getItem('absences');
    if (!existingAbsences || JSON.parse(existingAbsences).length === 0) {
        localStorage.setItem('absences', JSON.stringify(sampleAbsencesWithDepartments));
        console.log('📊 Dados de exemplo de ausências com departamentos inicializados');
    }
};

export default sampleAbsencesWithDepartments;
