// Script para limpar notificações persistentes
// Execute este script no console do navegador para limpar todas as notificações

console.log('🧹 Limpando notificações persistentes...');

// Limpar localStorage de notificações
const keysToClear = [
    'emailLogs',
    'passwordHistory',
    'passwordResetAudit',
    'notifications',
    'toast-notifications',
    'react-hot-toast',
    'persistent-notifications'
];

keysToClear.forEach(key => {
    if (localStorage.getItem(key)) {
        console.log(`🗑️ Removendo ${key} do localStorage`);
        localStorage.removeItem(key);
    }
});

// Limpar sessionStorage também
keysToClear.forEach(key => {
    if (sessionStorage.getItem(key)) {
        console.log(`🗑️ Removendo ${key} do sessionStorage`);
        sessionStorage.removeItem(key);
    }
});

// Limpar cookies relacionados a notificações
document.cookie.split(";").forEach(function (c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

console.log('✅ Notificações persistentes limpas!');
console.log('🔄 Recarregue a página para aplicar as mudanças');

