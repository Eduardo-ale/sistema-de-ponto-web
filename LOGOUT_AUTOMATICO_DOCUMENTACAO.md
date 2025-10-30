# Sistema de Logout Automático - CORE RH

## 📋 Visão Geral

O sistema de logout automático por inatividade foi implementado para garantir a segurança das sessões de usuário no sistema CORE RH. Ele monitora a atividade do usuário e executa logout automático após um período configurável de inatividade.

## 🔧 Componentes Implementados

### 1. **useAutoLogout Hook** (`src/hooks/useAutoLogout.js`)
- **Função:** Gerencia toda a lógica de logout automático
- **Recursos:**
  - Monitora eventos de atividade (mouse, teclado, scroll, etc.)
  - Executa logout após período de inatividade
  - Exibe aviso antes do logout
  - Permite estender sessão
  - Logs de auditoria

### 2. **SessionWarningModal** (`src/components/modals/SessionWarningModal.jsx`)
- **Função:** Modal elegante de aviso de sessão prestes a expirar
- **Recursos:**
  - Countdown visual em tempo real
  - Barra de progresso animada
  - Botões para continuar ou sair
  - Design dark mode consistente
  - Animações suaves com Framer Motion

### 3. **systemConfig.js** (`src/config/systemConfig.js`)
- **Função:** Configurações centralizadas do sistema
- **Recursos:**
  - Timeout de sessão configurável
  - Tempo de aviso antes do logout
  - Lista de eventos monitorados
  - Configurações de desenvolvimento/teste

### 4. **SessionStatus** (`src/components/ui/SessionStatus.jsx`)
- **Função:** Componente opcional para mostrar status da sessão
- **Recursos:**
  - Timer de inatividade em tempo real
  - Indicadores visuais de status
  - Cores dinâmicas baseadas no tempo

## ⚙️ Configurações

### Configurações Padrão (Produção)
```javascript
{
    sessionTimeoutMinutes: 15,        // 15 minutos de inatividade
    warningBeforeLogout: 1,            // Aviso 1 minuto antes
    warningDurationSeconds: 60,       // 60 segundos de aviso
    enableAutoLogout: true,           // Habilitado
    enableSessionWarning: true,       // Aviso habilitado
    logLogoutEvents: true             // Logs habilitados
}
```

### Configurações de Desenvolvimento
```javascript
{
    sessionTimeoutMinutes: 2,         // 2 minutos para testes
    warningBeforeLogout: 0.5,         // 30 segundos de aviso
    debugMode: true,                  // Logs detalhados
    testMode: true                    // Modo de teste
}
```

## 🎯 Como Usar

### 1. **Integração Básica**
```jsx
import { useAutoLogout } from '../hooks/useAutoLogout';

const MyComponent = () => {
    const {
        showWarning,
        timeRemaining,
        handleExtendSession,
        handleManualLogout,
        handleCloseWarning
    } = useAutoLogout();

    return (
        <div>
            {/* Seu conteúdo */}
            <SessionWarningModal
                isOpen={showWarning}
                onClose={handleCloseWarning}
                onExtendSession={handleExtendSession}
                onLogout={handleManualLogout}
                timeRemaining={timeRemaining}
            />
        </div>
    );
};
```

### 2. **Configuração Personalizada**
```jsx
// Timeout personalizado (30 minutos)
const autoLogout = useAutoLogout(30);
```

### 3. **Status da Sessão (Opcional)**
```jsx
import SessionStatus from '../ui/SessionStatus';

<SessionStatus 
    lastActivity={lastActivity} 
    isActive={true} 
/>
```

## 🔒 Eventos Monitorados

O sistema monitora os seguintes eventos para detectar atividade:
- `mousemove` - Movimento do mouse
- `keydown` / `keyup` - Teclas pressionadas
- `scroll` - Rolagem da página
- `click` - Cliques
- `touchstart` / `touchmove` - Toques em dispositivos móveis
- `focus` / `blur` - Mudanças de foco

## 🎨 Recursos de UX/UI

### **Modal de Aviso**
- **Design:** Dark mode consistente com o sistema
- **Animações:** Framer Motion para transições suaves
- **Countdown:** Timer visual em tempo real
- **Progress Bar:** Barra de progresso animada
- **Botões:** Ações claras (Continuar/Sair)

### **Feedback Visual**
- **Toasts:** Notificações de status
- **Cores:** Verde (ativo), Amarelo (aviso), Vermelho (crítico)
- **Ícones:** Lucide React para consistência
- **Responsivo:** Funciona em desktop e mobile

## 🚀 Comportamento Esperado

### **Fluxo Normal**
1. Usuário fica inativo por 14 minutos
2. Modal de aviso aparece com countdown de 1 minuto
3. Usuário pode escolher:
   - **Continuar:** Estende a sessão por mais 15 minutos
   - **Sair:** Executa logout imediatamente
4. Se não escolher nada: logout automático após 1 minuto

### **Logout Automático**
1. Limpa todos os dados do localStorage
2. Executa função de logout do AuthContext
3. Redireciona para `/login`
4. Exibe toast de confirmação
5. Registra evento no log (se habilitado)

## 🔧 Personalização

### **Alterar Timeout**
```javascript
// Em systemConfig.js
export const SYSTEM_CONFIG = {
    sessionTimeoutMinutes: 30,  // 30 minutos
    warningBeforeLogout: 2,      // Aviso 2 minutos antes
};
```

### **Adicionar Eventos**
```javascript
// Em systemConfig.js
activityEvents: [
    'mousemove',
    'keydown',
    'customEvent'  // Seu evento personalizado
],
```

### **Desabilitar Funcionalidade**
```javascript
// Em systemConfig.js
export const SYSTEM_CONFIG = {
    enableAutoLogout: false,     // Desabilita logout automático
    enableSessionWarning: false, // Desabilita avisos
};
```

## 🐛 Debug e Testes

### **Modo Debug**
```javascript
// Em systemConfig.js
debugMode: true  // Ativa logs detalhados no console
```

### **Modo Teste**
```javascript
// Em systemConfig.js
testMode: true   // Timeouts reduzidos para testes
```

## 📊 Logs e Auditoria

O sistema registra os seguintes eventos (quando habilitado):
- Início de monitoramento de sessão
- Detecção de atividade do usuário
- Exibição de avisos de sessão
- Extensão de sessão
- Logout automático
- Logout manual

## 🔐 Segurança

### **Dados Limpos no Logout**
- `localStorage.removeItem('token')`
- `localStorage.removeItem('sessionData')`
- `localStorage.removeItem('sessionId')`
- Outros dados sensíveis conforme configurado

### **Proteção contra Spam**
- Debounce de 1 segundo para eventos de atividade
- Timers otimizados para performance
- Cleanup automático de listeners

## 🎯 Próximos Passos

1. **Integração com Backend:** Registrar eventos de logout no servidor
2. **Configuração por Usuário:** Diferentes timeouts por perfil
3. **Notificações Push:** Avisos mesmo com aba fechada
4. **Analytics:** Métricas de uso e comportamento
5. **Configuração Admin:** Interface para ajustar timeouts

---

**Sistema implementado com sucesso!** ✅
O logout automático por inatividade está totalmente funcional e integrado ao sistema CORE RH.
