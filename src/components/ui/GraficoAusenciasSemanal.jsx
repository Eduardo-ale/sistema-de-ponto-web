import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar
} from 'recharts';
import { Calendar, TrendingUp, Users, FileText, FileSpreadsheet, Download, Clock, Mail, RefreshCw } from 'lucide-react';
import { useAbsencesData } from '../../hooks/useAbsencesData';
import { useAutoReportStatus } from '../../hooks/useAutoReportStatus';
import FilterByDepartment from './FilterByDepartment';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

const GraficoAusenciasSemanal = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('Todos');
    const { weeklyData, loading } = useAbsencesData(selectedDepartment);
    const {
        status: reportStatus,
        config,
        executeManualReport,
        formatDateTime,
        getStatusInfo,
        loading: statusLoading
    } = useAutoReportStatus();
    const chartRef = useRef(null);

    // Função para lidar com mudanças no filtro de departamento
    const handleDepartmentFilterChange = async (department) => {
        setSelectedDepartment(department);
        toast.success(`Filtro aplicado: ${department}`, {
            duration: 2000,
            icon: '🔍'
        });
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium text-gray-200 mb-2">
                        {new Date(label).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit'
                        })}
                    </p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-300">{entry.dataKey}:</span>
                            <span className="text-white font-medium">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Função para exportar PDF
    const exportarPDF = async () => {
        if (!chartRef.current || weeklyData.length === 0) {
            alert('Nenhum dado disponível para exportar');
            return;
        }

        try {
            // Capturar o gráfico como imagem
            const canvas = await html2canvas(chartRef.current, {
                scale: 2,
                backgroundColor: '#1f2937',
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');

            // Criar PDF
            const pdf = new jsPDF('landscape', 'mm', 'a4');

            // Cabeçalho do sistema
            pdf.setFontSize(16);
            pdf.setTextColor(255, 255, 255);
            pdf.text('Sistema de Registro de Ponto – CORE RH', 15, 15);

            pdf.setFontSize(12);
            pdf.text('Relatório Semanal de Ausências', 15, 25);

            // Adicionar imagem do gráfico
            const imgWidth = 270;
            const imgHeight = 130;
            pdf.addImage(imgData, 'PNG', 10, 35, imgWidth, imgHeight);

            // Rodapé
            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Gerado automaticamente pelo sistema em ${new Date().toLocaleString('pt-BR')}`, 15, 175);

            // Salvar arquivo
            pdf.save('Relatorio_Semanal_Ausencias.pdf');

        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao gerar PDF. Tente novamente.');
        }
    };

    // Função para exportar Excel
    const exportarExcel = () => {
        if (weeklyData.length === 0) {
            alert('Nenhum dado disponível para exportar');
            return;
        }

        try {
            // Preparar dados para Excel
            const excelData = weeklyData.map(item => ({
                'Data': new Date(item.dia).toLocaleDateString('pt-BR'),
                'Total': item.Total,
                'Folgas': item.Folgas,
                'Afastamentos': item.Afastamentos,
                'Feriados': item.Feriados
            }));

            // Criar planilha
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Configurar largura das colunas
            const colWidths = [
                { wch: 12 }, // Data
                { wch: 8 },  // Total
                { wch: 10 }, // Folgas
                { wch: 12 }, // Afastamentos
                { wch: 10 }  // Feriados
            ];
            worksheet['!cols'] = colWidths;

            // Criar workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Ausências Semanais');

            // Gerar arquivo
            const excelBuffer = XLSX.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            saveAs(blob, 'Ausencias_Semanais.xlsx');

        } catch (error) {
            console.error('Erro ao exportar Excel:', error);
            alert('Erro ao gerar Excel. Tente novamente.');
        }
    };

    // Função para executar relatório automático manualmente
    const handleManualReport = async () => {
        try {
            toast.loading('Executando relatório automático...', { id: 'manual-report' });

            // Simular geração de PDF
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.loading('Gerando PDF do gráfico...', { id: 'manual-report' });

            // Simular captura do gráfico
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.loading('Enviando e-mail para destinatários...', { id: 'manual-report' });

            // Executar relatório
            const result = await executeManualReport();

            if (result.success) {
                toast.success('Relatório executado e enviado com sucesso!', {
                    id: 'manual-report',
                    duration: 4000
                });
            } else {
                toast.error(`Erro: ${result.error}`, {
                    id: 'manual-report',
                    duration: 4000
                });
            }
        } catch (error) {
            toast.error('Erro ao executar relatório automático', {
                id: 'manual-report',
                duration: 4000
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-900/40 border border-gray-700/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-800/30 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200">
                            Tendência Semanal de Ausências
                        </h3>
                        <p className="text-sm text-gray-400">
                            Últimos 7 dias - Feriados, folgas e afastamentos
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Botões de Exportação */}
                    <div className="flex items-center space-x-2">
                        <motion.button
                            onClick={exportarPDF}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200 text-sm font-medium"
                            disabled={loading || weeklyData.length === 0}
                        >
                            <FileText className="h-4 w-4" />
                            <span>PDF</span>
                        </motion.button>

                        <motion.button
                            onClick={exportarExcel}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 hover:border-green-500/50 rounded-lg text-green-400 hover:text-green-300 transition-all duration-200 text-sm font-medium"
                            disabled={loading || weeklyData.length === 0}
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Excel</span>
                        </motion.button>

                        <motion.button
                            onClick={handleManualReport}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg text-blue-400 hover:text-blue-300 transition-all duration-200 text-sm font-medium"
                            disabled={loading || statusLoading}
                        >
                            <Mail className="h-4 w-4" />
                            <span>Enviar</span>
                        </motion.button>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Semanal</span>
                    </div>
                </div>
            </div>

            {/* Filtro por Departamento */}
            <FilterByDepartment
                onFilterChange={handleDepartmentFilterChange}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
            />

            {/* Gráfico */}
            <div ref={chartRef} data-testid="grafico-ausencias" className="h-80">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-pulse text-center">
                            <div className="h-8 bg-gray-600 rounded w-48 mx-auto mb-4"></div>
                            <div className="h-64 bg-gray-600 rounded w-full"></div>
                        </div>
                    </div>
                ) : weeklyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="dataFormatada"
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{
                                    color: '#D1D5DB',
                                    fontSize: '12px',
                                    paddingTop: '20px'
                                }}
                            />

                            {/* Linhas do gráfico */}
                            <Line
                                type="monotone"
                                dataKey="Total"
                                stroke="#EF4444"
                                strokeWidth={3}
                                dot={{ r: 5, fill: '#EF4444', strokeWidth: 2 }}
                                activeDot={{ r: 7, stroke: '#EF4444', strokeWidth: 2 }}
                                name="Total"
                            />
                            <Line
                                type="monotone"
                                dataKey="Folgas"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#3B82F6' }}
                                activeDot={{ r: 6 }}
                                name="Folgas"
                            />
                            <Line
                                type="monotone"
                                dataKey="Afastamentos"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#F59E0B' }}
                                activeDot={{ r: 6 }}
                                name="Afastamentos"
                            />
                            <Line
                                type="monotone"
                                dataKey="Feriados"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#8B5CF6' }}
                                activeDot={{ r: 6 }}
                                name="Feriados"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-center">
                        <div>
                            <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400 mb-2">Nenhum dado disponível</p>
                            <p className="text-sm text-gray-500">
                                Registre ausências para ver o gráfico
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Resumo dos dados */}
            {!loading && weeklyData.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Semanal', value: weeklyData.reduce((sum, day) => sum + day.Total, 0), color: 'text-red-400' },
                        { label: 'Média Diária', value: Math.round(weeklyData.reduce((sum, day) => sum + day.Total, 0) / 7), color: 'text-orange-400' },
                        { label: 'Dia com Mais', value: Math.max(...weeklyData.map(day => day.Total)), color: 'text-yellow-400' },
                        { label: 'Dia com Menos', value: Math.min(...weeklyData.map(day => day.Total)), color: 'text-green-400' }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-800/50 rounded-lg p-3 text-center"
                        >
                            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Status dos Relatórios Automáticos */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/30"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <h4 className="text-sm font-medium text-gray-200">
                            Relatórios Automáticos
                        </h4>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                            Próxima execução: {config.nextExecution ? new Date(config.nextExecution).toLocaleString('pt-BR') : 'N/A'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status da Última Execução */}
                    <div className="flex items-center space-x-3">
                        {(() => {
                            const statusInfo = getStatusInfo();
                            return (
                                <>
                                    <div className={`p-2 rounded-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                                        <span className="text-lg">{statusInfo.icon}</span>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${statusInfo.color}`}>
                                            {statusInfo.text}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatDateTime(reportStatus.lastExecution?.timestamp)}
                                        </p>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Estatísticas */}
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                            <RefreshCw className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-200">
                                {reportStatus.totalExecutions} execuções
                            </p>
                            <p className="text-xs text-gray-400">
                                Taxa de sucesso: {reportStatus.successRate}%
                            </p>
                        </div>
                    </div>

                    {/* Configuração */}
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                            <Mail className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-200">
                                {config.recipients?.length || 0} destinatários
                            </p>
                            <p className="text-xs text-gray-400">
                                Envio diário às 07h00
                            </p>
                        </div>
                    </div>
                </div>

                {/* Informações Adicionais */}
                <div className="mt-4 pt-3 border-t border-gray-700/30">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center space-x-4">
                            <span>📧 {config.emailFrom}</span>
                            <span>🕐 {config.timezone}</span>
                            <span>📅 {config.schedule}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>Última atualização:</span>
                            <span>{new Date().toLocaleTimeString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default GraficoAusenciasSemanal;
