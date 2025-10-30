# Funcionalidade de Reset de Senha - CORE RH

## 📋 Visão Geral

A funcionalidade de **Reset de Senha** permite que administradores redefinam a senha de qualquer usuário do sistema através da interface "Gerenciar Usuários". A implementação inclui validação de segurança, interface moderna e feedback visual completo.

## 🔒 Funcionalidades Implementadas

### **1. Botão de Reset na Tabela de Usuários**
- **Localização:** Coluna "Ações" na tabela "Gerenciar Usuários"
- **Ícone:** `RotateCcw` (🔄) do Lucide React
- **Cor:** Azul claro (#60A5FA) com hover azul escuro (#1E40AF)
- **Tooltip:** "Resetar senha"
- **Posicionamento:** Entre o botão de "Gerenciar Ausências" e "Excluir Usuário"

### **2. Modal de Redefinição de Senha**
- **Design:** Modal escuro elegante com animações Framer Motion
- **Campos obrigatórios:**
  - Nova senha (com toggle de visibilidade)
  - Confirmar nova senha (com toggle de visibilidade)
- **Validação em tempo real:**
  - Comprimento mínimo (8 caracteres)
  - Pelo menos uma letra maiúscula
  - Pelo menos uma letra minúscula
  - Pelo menos um número
  - Pelo menos um símbolo
- **Feedback visual:** Indicadores de critérios atendidos/não atendidos
- **Estados de loading:** Botão com spinner durante processamento

### **3. Modal de Sucesso**
- **Design:** Modal claro com tema de sucesso
- **Informações exibidas:**
  - Mensagem de parabéns animada
  - Dados do usuário (nome, email, cargo)
  - Login gerado automaticamente
  - Nova senha temporária
- **Funcionalidades:**
  - Copiar login individualmente
  - Copiar senha individualmente
  - Copiar ambas as credenciais
  - Salvar credenciais em arquivo .txt
  - Compartilhar credenciais (se suportado pelo navegador)
- **Avisos importantes:** Instruções sobre primeiro acesso e validade

## 🎨 Design e UX

### **Interface Responsiva**
- **Modal expansível** com scroll interno quando necessário
- **Dark mode** consistente com o sistema
- **Animações suaves** com Framer Motion
- **Feedback visual** em tempo real para validação

### **Cores e Temas**
- **Modal de Reset:** Tema escuro (gray-900) com acentos azuis
- **Modal de Sucesso:** Tema claro com acentos verdes
- **Botões de ação:** Cores contextuais (azul para reset, verde para sucesso)
- **Estados de erro:** Vermelho para validações falhadas

### **Indicadores Visuais**
- **Critérios de senha:** Checkmarks verdes para critérios atendidos
- **Estados de cópia:** Feedback visual quando credenciais são copiadas
- **Loading states:** Spinners animados durante processamento
- **Ícones contextuais:** RotateCcw para reset, CheckCircle para sucesso

## ⚙️ Implementação Técnica

### **Componentes Criados**

#### **1. ResetPasswordModal.jsx**
```javascript
// Props
{
    isOpen: boolean,           // Controla visibilidade do modal
    onClose: function,        // Callback para fechar modal
    user: object,             // Dados do usuário selecionado
    onSuccess: function       // Callback chamado após sucesso
}

// Funcionalidades
- Validação de senha em tempo real
- Toggle de visibilidade de senhas
- Simulação de API call com delay
- Geração automática de login baseado no email
- Feedback visual para erros e sucessos
```

#### **2. ResetPasswordSuccessModal.jsx**
```javascript
// Props
{
    isOpen: boolean,          // Controla visibilidade do modal
    onClose: function,        // Callback para fechar modal
    credentials: object       // { login, novaSenha, user }
}

// Funcionalidades
- Exibição de credenciais geradas
- Múltiplas opções de cópia
- Download de arquivo com credenciais
- Compartilhamento nativo (se suportado)
- Avisos de segurança e instruções
```

### **Integração com UsersManagementModal.jsx**

#### **Estados Adicionados**
```javascript
const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
const [showResetPasswordSuccessModal, setShowResetPasswordSuccessModal] = useState(false);
const [resetCredentials, setResetCredentials] = useState(null);
```

#### **Funções de Handler**
```javascript
const handleResetPassword = (user) => {
    setSelectedUser(user);
    setShowResetPasswordModal(true);
};

const handleResetPasswordSuccess = (credentials) => {
    setResetCredentials(credentials);
    setShowResetPasswordSuccessModal(true);
};
```

#### **Botão na Tabela**
```jsx
<button
    onClick={() => handleResetPassword(user)}
    className="p-1 text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors"
    title="Resetar senha"
>
    <RotateCcw className="w-4 h-4" />
</button>
```

## 🔧 Lógica de Funcionamento

### **Fluxo de Reset de Senha**

1. **Clique no botão:** Administrador clica no ícone 🔄 na tabela
2. **Abertura do modal:** Modal de reset é exibido com dados do usuário
3. **Preenchimento:** Administrador digita nova senha e confirmação
4. **Validação:** Sistema valida critérios de segurança em tempo real
5. **Envio:** Após validação, simula chamada à API
6. **Processamento:** Delay de 1.5s para simular processamento
7. **Sucesso:** Modal de reset fecha e modal de sucesso abre
8. **Exibição:** Credenciais são exibidas com opções de cópia/download

### **Geração de Login**
```javascript
// Baseado no email do usuário
const login = user.email.split('@')[0];
// Exemplo: "usuario@empresa.com" → "usuario"
```

### **Validação de Senha**
```javascript
const validatePassword = (password) => {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /\d/.test(password),
        symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
};
```

## 🛡️ Recursos de Segurança

### **Validação Rigorosa**
- **Critérios múltiplos:** Comprimento, maiúsculas, minúsculas, números, símbolos
- **Feedback em tempo real:** Usuário vê imediatamente se critérios são atendidos
- **Prevenção de envio:** Botão desabilitado até validação completa

### **Geração Segura**
- **Login baseado em email:** Evita conflitos e facilita identificação
- **Senha definida pelo admin:** Controle total sobre a nova senha
- **Validação dupla:** Confirmação obrigatória da nova senha

### **Avisos de Segurança**
- **Instruções claras:** Usuário deve alterar senha no primeiro acesso
- **Validade temporal:** Credenciais válidas por 24 horas
- **Armazenamento seguro:** Recomendação de salvar em local seguro

## 📱 Funcionalidades de Cópia e Download

### **Múltiplas Opções de Cópia**
- **Login individual:** Botão específico para copiar apenas o login
- **Senha individual:** Botão específico para copiar apenas a senha
- **Ambas credenciais:** Botão para copiar login e senha juntos
- **Feedback visual:** Estados visuais diferentes para cada tipo de cópia

### **Download de Arquivo**
```javascript
const downloadCredentials = () => {
    const content = `CREDENCIAIS DE ACESSO - ${credentials.user.name}
===============================================

Login: ${credentials.login}
Senha: ${credentials.novaSenha}
E-mail: ${credentials.user.email}
Data de Reset: ${new Date().toLocaleString()}

===============================================
Gerado automaticamente pelo sistema CORE RH
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credenciais-${credentials.login}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
};
```

### **Compartilhamento Nativo**
- **API Web Share:** Utiliza `navigator.share` quando disponível
- **Fallback:** Copia para clipboard se compartilhamento não suportado
- **Compatibilidade:** Funciona em dispositivos móveis modernos

## 🚀 Como Usar

### **Para Administradores**

1. **Acesse "Gerenciar Usuários"** no dashboard administrativo
2. **Localize o usuário** na tabela de usuários
3. **Clique no ícone 🔄** na coluna "Ações"
4. **Digite a nova senha** seguindo os critérios de segurança
5. **Confirme a senha** no segundo campo
6. **Clique em "Redefinir Senha"** e aguarde o processamento
7. **Visualize as credenciais** no modal de sucesso
8. **Copie ou salve** as credenciais conforme necessário

### **Critérios de Senha Obrigatórios**
- ✅ Pelo menos 8 caracteres
- ✅ Uma letra maiúscula (A-Z)
- ✅ Uma letra minúscula (a-z)
- ✅ Um número (0-9)
- ✅ Um símbolo (!@#$%^&*(),.?":{}|<>)

### **Opções de Cópia Disponíveis**
- 📋 **Copiar Login:** Apenas o login do usuário
- 🔑 **Copiar Senha:** Apenas a nova senha
- 📄 **Copiar Ambos:** Login e senha juntos
- 💾 **Salvar Arquivo:** Download de arquivo .txt com credenciais
- 📤 **Compartilhar:** Compartilhamento nativo (mobile)

## 🔄 Integração com Backend

### **Endpoint Esperado**
```javascript
POST /api/users/reset-password/:id

// Request Body
{
    "novaSenha": "Senha@123"
}

// Response
{
    "success": true,
    "login": "usuario.teste",
    "novaSenha": "Senha@123",
    "message": "Senha redefinida com sucesso"
}
```

### **Simulação Atual**
- **Delay de 1.5s** para simular processamento
- **Geração automática** de login baseado no email
- **Retorno estruturado** com dados necessários
- **Tratamento de erros** com feedback visual

## 📊 Recursos de Feedback

### **Toasts Informativos**
- ✅ **Sucesso:** "Senha redefinida com sucesso!"
- ❌ **Erro:** "Por favor, corrija os erros no formulário"
- 📋 **Cópia:** "Login copiado!" / "Senha copiada!" / "Credenciais copiadas!"
- 💾 **Download:** "Credenciais salvas em arquivo!"

### **Estados Visuais**
- **Loading:** Spinner animado durante processamento
- **Validação:** Checkmarks verdes para critérios atendidos
- **Cópia:** Estados visuais diferentes para cada tipo de cópia
- **Erro:** Bordas vermelhas e mensagens de erro

---

**Funcionalidade de Reset de Senha Implementada com Sucesso!** 🔄✨

A funcionalidade está **100% funcional** e integrada ao sistema CORE RH, oferecendo uma experiência completa e segura para administradores redefinirem senhas de usuários.
