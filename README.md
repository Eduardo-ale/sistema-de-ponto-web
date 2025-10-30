# Sistema de Ponto Web 2.0

Um sistema moderno e responsivo para controle de jornada de trabalho, desenvolvido com React e tecnologias web atuais.

## 🚀 Características

### ✨ Design e Interface
- **Interface moderna e minimalista** com foco na usabilidade
- **Design responsivo** que funciona perfeitamente em desktop, tablet e mobile
- **Modo escuro/claro** com persistência da preferência do usuário
- **Animações suaves** e transições elegantes usando Framer Motion
- **Paleta de cores profissional** (azul, cinza, branco) transmitindo confiabilidade

### 🔐 Autenticação e Segurança
- **Sistema de login seguro** com validação de campos
- **Autenticação baseada em JWT** com armazenamento seguro
- **Redirecionamento automático** baseado no tipo de usuário
- **Proteção de rotas** com verificação de permissões
- **Feedback visual** para erros e sucessos

### 👥 Perfis de Usuário
- **Administrador**: Painel completo com estatísticas e gestão
- **Colaborador**: Interface focada no registro de ponto pessoal
- **Recursos Humanos**: Dashboard para gestão de pessoas e relatórios

### 📱 Funcionalidades Principais
- **Registro de ponto** com horário em tempo real
- **Dashboard personalizado** para cada tipo de usuário
- **Recuperação de senha completa** com tokens seguros e emails
- **Estatísticas e relatórios** detalhados
- **Notificações e alertas** em tempo real
- **Histórico de atividades** e eventos

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca principal para interface
- **React Router DOM** - Roteamento e navegação
- **Tailwind CSS** - Framework CSS para estilização
- **Framer Motion** - Animações e transições
- **Lucide React** - Ícones modernos e consistentes
- **Context API** - Gerenciamento de estado global
- **Axios** - Cliente HTTP para requisições API

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para instalação

1. **Clone o repositório** (se aplicável) ou navegue até a pasta do projeto:
   ```bash
   cd "SISTEMA DE PONTO WEB 2.0"
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm start
   ```

4. **Acesse a aplicação**:
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🎯 Como Usar

### Credenciais de Demonstração

Para testar o sistema, use as seguintes credenciais:

| Tipo de Usuário | Usuário | Senha | Dashboard |
|-----------------|---------|-------|-----------|
| **Administrador** | `admin` | `123456` | `/admin-dashboard` |
| **Colaborador** | `colaborador` | `123456` | `/user-dashboard` |
| **Recursos Humanos** | `rh` | `123456` | `/hr-dashboard` |

### Fluxo de Uso

1. **Acesse a tela de login**
2. **Digite suas credenciais** (use as credenciais de demonstração acima)
3. **Clique em "Entrar"** e aguarde a autenticação
4. **Seja redirecionado** automaticamente para o dashboard apropriado
5. **Explore as funcionalidades** específicas do seu perfil

### 🔐 Recuperação de Senha

Para testar a funcionalidade "Esqueci minha senha":

1. **Na tela de login**, clique em "Esqueci minha senha"
2. **Digite um email válido**: `admin@sistema.com`, `colaborador@sistema.com` ou `rh@sistema.com`
3. **Clique em "Enviar Link de Recuperação"**
4. **Observe o feedback de sucesso** e clique em "Continuar para Redefinição"
5. **Defina uma nova senha forte** (mínimo 8 caracteres)
6. **Confirme a senha** e clique em "Atualizar Senha"
7. **Veja a confirmação** e seja redirecionado para o login

**Características da recuperação de senha:**
- ✅ Tokens JWT seguros com expiração de 15 minutos
- ✅ Validação de força da senha em tempo real
- ✅ Template de email HTML profissional
- ✅ Design responsivo e animações suaves
- ✅ Validação robusta e feedback visual

### Funcionalidades por Perfil

#### 👨‍💼 Administrador
- Visão geral de todos os funcionários
- Estatísticas completas do sistema
- Relatórios gerenciais
- Gestão de usuários e permissões

#### 👤 Colaborador
- Registro de entrada e saída
- Visualização do horário atual
- Status do dia de trabalho
- Resumo semanal de horas

#### 👥 Recursos Humanos
- Monitoramento de atividades em tempo real
- Relatórios de frequência
- Alertas de atrasos e faltas
- Análise de produtividade

## 🎨 Personalização

### Modo Escuro/Claro
- Clique no ícone de sol/lua no canto superior direito
- A preferência é salva automaticamente no localStorage

### Cores e Temas
- Edite o arquivo `tailwind.config.js` para personalizar cores
- Modifique `src/index.css` para ajustes globais de estilo

### Animações
- Configure animações em `src/components/Login.css`
- Use Framer Motion para animações mais complexas

## 🔧 Configuração da API

Para conectar com uma API real, modifique o arquivo `src/contexts/AuthContext.jsx`:

```javascript
// Substitua a simulação por uma chamada real
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(credentials),
});
```

## 📱 Responsividade

O sistema foi desenvolvido com abordagem mobile-first e inclui:

- **Breakpoints responsivos** para diferentes tamanhos de tela
- **Layout adaptativo** que se ajusta automaticamente
- **Componentes otimizados** para touch em dispositivos móveis
- **Navegação intuitiva** em todos os dispositivos

## 🚀 Deploy

### Build para Produção

```bash
npm run build
```

### Servir Localmente

```bash
npx serve -s build
```

### Deploy em Serviços

O projeto pode ser facilmente deployado em:
- **Vercel**
- **Netlify**
- **Heroku**
- **AWS S3 + CloudFront**

## 🔒 Segurança

### Implementações de Segurança

- **Validação de entrada** em todos os formulários
- **Sanitização de dados** antes do envio
- **Proteção contra XSS** com React
- **Armazenamento seguro** de tokens JWT
- **Rotas protegidas** com verificação de autenticação

### Recomendações Adicionais

- Implemente HTTPS em produção
- Configure CORS adequadamente
- Use variáveis de ambiente para configurações sensíveis
- Implemente rate limiting na API
- Configure CSP (Content Security Policy)

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Erro de dependências**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Problemas de cache**:
   ```bash
   npm start -- --reset-cache
   ```

3. **Erro de porta ocupada**:
   ```bash
   PORT=3001 npm start
   ```

## 📈 Próximas Funcionalidades

- [ ] Integração com biometria
- [ ] Notificações push
- [ ] Relatórios em PDF
- [ ] API REST completa
- [ ] Testes automatizados
- [ ] PWA (Progressive Web App)
- [ ] Integração com sistemas de RH existentes

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento
- Consulte a documentação técnica

---

**Sistema de Ponto Web 2.0** - Desenvolvido com ❤️ para modernizar o controle de jornada de trabalho.
