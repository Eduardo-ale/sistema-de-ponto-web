// Dados de exemplo para o histórico de relatórios
const sampleReportHistory = [
    {
        id: 1,
        tipoRelatorio: 'Relatório Semanal de Ausências',
        dataEnvio: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
        destinatarios: 'rh@saude.ms.gov.br, admin@core.ms.gov.br, ti@core.ms.gov.br',
        statusEnvio: 'Sucesso',
        caminhoPdf: 'Relatorio_Ausencias_2025-10-20.pdf',
        observacao: 'Relatório executado automaticamente',
        tamanhoArquivo: '2.3 MB'
    },
    {
        id: 2,
        tipoRelatorio: 'Relatório Semanal de Ausências',
        dataEnvio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
        destinatarios: 'rh@saude.ms.gov.br, admin@core.ms.gov.br',
        statusEnvio: 'Sucesso',
        caminhoPdf: 'Relatorio_Ausencias_2025-10-19.pdf',
        observacao: 'Relatório executado manualmente',
        tamanhoArquivo: '2.1 MB'
    },
    {
        id: 3,
        tipoRelatorio: 'Relatório Semanal de Ausências',
        dataEnvio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
        destinatarios: 'rh@saude.ms.gov.br, admin@core.ms.gov.br, ti@core.ms.gov.br',
        statusEnvio: 'Falha',
        caminhoPdf: 'Relatorio_Ausencias_2025-10-18.pdf',
        observacao: 'Erro de conexão com servidor de e-mail',
        tamanhoArquivo: '0 MB'
    },
    {
        id: 4,
        tipoRelatorio: 'Relatório Semanal de Ausências',
        dataEnvio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semana atrás
        destinatarios: 'rh@saude.ms.gov.br, admin@core.ms.gov.br, ti@core.ms.gov.br',
        statusEnvio: 'Sucesso',
        caminhoPdf: 'Relatorio_Ausencias_2025-10-14.pdf',
        observacao: 'Relatório executado automaticamente',
        tamanhoArquivo: '2.4 MB'
    },
    {
        id: 5,
        tipoRelatorio: 'Relatório Diário',
        dataEnvio: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 dias atrás
        destinatarios: 'admin@core.ms.gov.br',
        statusEnvio: 'Sucesso',
        caminhoPdf: 'Relatorio_Diario_2025-10-13.pdf',
        observacao: 'Relatório diário de presença',
        tamanhoArquivo: '1.8 MB'
    }
];

// Função para inicializar dados de exemplo
export const initializeSampleHistory = () => {
    const existingHistory = localStorage.getItem('reportHistory');
    if (!existingHistory || JSON.parse(existingHistory).length === 0) {
        localStorage.setItem('reportHistory', JSON.stringify(sampleReportHistory));
        console.log('📊 Dados de exemplo do histórico de relatórios inicializados');
    }
};

export default sampleReportHistory;
