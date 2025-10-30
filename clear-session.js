// Script para limpar dados de sessão e forçar login
// Execute este script no console do navegador para limpar os dados

console.log('🧹 Limpando dados de sessão...');

// Limpar localStorage
localStorage.removeItem('token');
localStorage.removeItem('sessionData');
localStorage.removeItem('sessionId');
localStorage.removeItem('auditLogs');

// Limpar sessionStorage
sessionStorage.removeItem('token');
sessionStorage.removeItem('user');

console.log('✅ Dados de sessão limpos! Recarregue a página para ir para o login.');

// Recarregar a página
window.location.reload();






