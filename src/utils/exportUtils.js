/**
 * Utilitários para exportação de dados em PDF, XLSX e CSV
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Gera nome padronizado de arquivo
 */
export function gerarNomeArquivo(tipo, periodo, formato) {
    const agora = new Date();
    const dataStr = agora.toISOString().split('T')[0];
    const horaStr = agora.toTimeString().split(' ')[0].replace(/:/g, '-');

    return `relatorio_${tipo}_${periodo}_${dataStr}_${horaStr}.${formato}`;
}

/**
 * Formata dados para exportação baseado nas colunas selecionadas
 */
export function formatarDadosParaExportacao(dados, colunas) {
    if (!Array.isArray(dados) || dados.length === 0) {
        return [];
    }

    // Se não há colunas selecionadas, retornar todas
    if (!colunas || colunas.length === 0) {
        return dados;
    }

    // Filtrar e formatar dados baseado nas colunas selecionadas
    return dados.map(item => {
        const itemFiltrado = {};
        colunas.forEach(coluna => {
            if (item.hasOwnProperty(coluna.key)) {
                itemFiltrado[coluna.label || coluna.key] = item[coluna.key];
            }
        });
        return itemFiltrado;
    });
}

/**
 * Exporta dados para CSV
 */
export function exportarParaCSV(dados, nomeArquivo, cabecalho = null) {
    try {
        if (!Array.isArray(dados) || dados.length === 0) {
            throw new Error('Nenhum dado para exportar');
        }

        // Preparar cabeçalho
        const headers = Object.keys(dados[0]);

        // Criar linhas CSV
        const linhas = [];

        // Adicionar informações do cabeçalho se fornecido
        if (cabecalho) {
            Object.entries(cabecalho).forEach(([key, value]) => {
                linhas.push(`${key},${value}`);
            });
            linhas.push(''); // Linha em branco
        }

        // Adicionar headers da tabela
        linhas.push(headers.join(','));

        // Adicionar dados
        dados.forEach(item => {
            const valores = headers.map(header => {
                const valor = item[header];
                // Escapar vírgulas e aspas
                if (typeof valor === 'string') {
                    return `"${valor.replace(/"/g, '""')}"`;
                }
                return valor !== null && valor !== undefined ? valor : '';
            });
            linhas.push(valores.join(','));
        });

        // Criar blob e fazer download
        const conteudo = linhas.join('\n');
        const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nomeArquivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Erro ao exportar CSV:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Exporta dados para XLSX
 */
export function exportarParaXLSX(dados, nomeArquivo, cabecalho = null, rodape = null) {
    try {
        if (!Array.isArray(dados) || dados.length === 0) {
            throw new Error('Nenhum dado para exportar');
        }

        // Criar workbook
        const wb = XLSX.utils.book_new();

        // Adicionar cabeçalho em uma planilha separada se fornecido
        if (cabecalho) {
            const headerData = Object.entries(cabecalho).map(([key, value]) => ({ Propriedade: key, Valor: value }));
            const wsHeader = XLSX.utils.json_to_sheet(headerData);
            XLSX.utils.book_append_sheet(wb, wsHeader, 'Informações');
        }

        // Preparar dados principais
        let dadosParaPlanilha = dados;
        if (Array.isArray(dados) && dados.length > 0) {
            // Garantir que todos os objetos tenham as mesmas chaves
            const todasChaves = [...new Set(dados.flatMap(obj => Object.keys(obj)))];
            dadosParaPlanilha = dados.map(item => {
                const linha = {};
                todasChaves.forEach(chave => {
                    linha[chave] = item[chave] !== null && item[chave] !== undefined ? item[chave] : '';
                });
                return linha;
            });
        }

        // Criar worksheet principal com dados
        const ws = XLSX.utils.json_to_sheet(dadosParaPlanilha);

        // Adicionar rodapé como última linha se fornecido
        if (rodape && Array.isArray(dadosParaPlanilha) && dadosParaPlanilha.length > 0) {
            const range = XLSX.utils.decode_range(ws['!ref']);
            let ultimaLinha = range.e.r + 1;

            // Linha em branco
            ultimaLinha++;

            // Adicionar rodapé
            Object.entries(rodape).forEach(([key, value]) => {
                const chaveCol = XLSX.utils.encode_cell({ r: ultimaLinha, c: 0 });
                const valorCol = XLSX.utils.encode_cell({ r: ultimaLinha, c: 1 });
                ws[chaveCol] = { t: 's', v: key };
                ws[valorCol] = { t: 's', v: String(value) };
                ultimaLinha++;
            });

            // Atualizar range
            ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: ultimaLinha - 1, c: range.e.c } });
        }

        // Ajustar largura das colunas
        if (Array.isArray(dadosParaPlanilha) && dadosParaPlanilha.length > 0) {
            const todasChaves = Object.keys(dadosParaPlanilha[0]);
            ws['!cols'] = todasChaves.map(() => ({ wch: 20 }));
        }

        // Adicionar worksheet principal ao workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

        // Fazer download
        XLSX.writeFile(wb, nomeArquivo);

        return { success: true };
    } catch (error) {
        console.error('Erro ao exportar XLSX:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Exporta dados para PDF
 */
export function exportarParaPDF(dados, nomeArquivo, cabecalho = null, rodape = null, titulo = 'Relatório') {
    try {
        if (!Array.isArray(dados) || dados.length === 0) {
            throw new Error('Nenhum dado para exportar');
        }

        // Criar documento PDF
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Configurações de fonte
        const fontSize = 10;
        const marginTop = 20;
        const marginLeft = 15;
        let yPos = marginTop;

        // Adicionar título
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(titulo, marginLeft, yPos);
        yPos += 10;

        // Adicionar informações do cabeçalho se fornecido
        if (cabecalho) {
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', 'normal');
            Object.entries(cabecalho).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, marginLeft, yPos);
                yPos += 6;
            });
            yPos += 5;
        }

        // Preparar dados para a tabela
        const headers = Object.keys(dados[0]);
        const tableData = dados.map(item =>
            headers.map(header => {
                const valor = item[header];
                if (valor === null || valor === undefined) {
                    return '';
                }
                if (typeof valor === 'object') {
                    return JSON.stringify(valor);
                }
                return String(valor);
            })
        );

        // Adicionar tabela
        doc.autoTable({
            head: [headers],
            body: tableData,
            startY: yPos,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: marginLeft, right: marginLeft },
            theme: 'striped'
        });

        // Obter posição Y final da tabela
        const finalY = doc.lastAutoTable.finalY || yPos;

        // Adicionar rodapé se fornecido
        if (rodape) {
            let rodapeY = finalY + 15;
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', 'bold');
            doc.text('Totalizações', marginLeft, rodapeY);
            rodapeY += 6;

            doc.setFont('helvetica', 'normal');
            Object.entries(rodape).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, marginLeft, rodapeY);
                rodapeY += 6;
            });
        }

        // Adicionar data/hora de geração
        const pagina = doc.internal.pages.length - 1;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        const dataGeracao = new Date().toLocaleString('pt-BR');
        doc.text(
            `Gerado em: ${dataGeracao}`,
            doc.internal.pageSize.width - marginLeft - doc.getTextWidth(`Gerado em: ${dataGeracao}`),
            doc.internal.pageSize.height - 10
        );

        // Fazer download
        doc.save(nomeArquivo);

        return { success: true };
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        return { success: false, error: error.message };
    }
}

