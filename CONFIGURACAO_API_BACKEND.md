# Configuração da API - Sistema de Ponto Web 2.0

## Configuração Necessária

### 1. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com:

```bash
# URL base da API (ajuste conforme seu backend)
REACT_APP_API_URL=http://localhost:3001/api

# Ambiente (development, production)
NODE_ENV=development

# Porta do servidor de desenvolvimento (opcional)
PORT=3001
```

### 2. Backend Necessário

O sistema agora requer um backend com os seguintes endpoints:

#### Dashboard:
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/activities?limit=10` - Atividades recentes
- `GET /api/dashboard/users/recent?limit=5` - Usuários recentes
- `GET /api/dashboard/charts/attendance` - Dados para gráficos

#### Usuários:
- `GET /api/users?page=1&limit=100` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário
- `PATCH /api/users/:id/status` - Alterar status

#### Notificações:
- `GET /api/notifications?limit=20` - Buscar notificações
- `PATCH /api/notifications/:id/read` - Marcar como lida
- `PATCH /api/notifications/read-all` - Marcar todas como lidas

#### Estatísticas:
- `GET /api/stats/general` - Estatísticas gerais
- `GET /api/stats/attendance?period=today` - Estatísticas de ponto
- `GET /api/stats/productivity?period=month` - Estatísticas de produtividade

### 3. Autenticação

O sistema espera:
- Token JWT no header `Authorization: Bearer <token>`
- Token armazenado em `localStorage.getItem('token')`
- Logout automático em caso de token expirado (401)

### 4. Estrutura de Resposta da API

Todas as respostas devem seguir o padrão:

```javascript
// Sucesso
{
  "success": true,
  "data": { /* dados */ },
  "message": "Mensagem de sucesso" // opcional
}

// Erro
{
  "success": false,
  "error": "Mensagem de erro"
}
```

### 5. CORS

Configure CORS no backend para permitir:
- Origin: `http://localhost:3001`
- Methods: GET, POST, PUT, DELETE, PATCH
- Headers: Authorization, Content-Type

### 6. Banco de Dados

O sistema espera as seguintes tabelas/coleções:

#### users
- id, name, email, role, department, status, createdAt, lastLogin

#### activities
- id, type, message, userId, userName, timestamp, details

#### notifications
- id, title, message, type, userId, timestamp, read

#### stats (calculadas)
- totalUsers, activeUsers, totalPoints, averageProductivity
- todayPoints, onTime, late, absent
- averageHours, completedTasks, pendingTasks, efficiency

### 7. Teste da Integração

Para testar se a integração está funcionando:

1. Configure o backend com os endpoints
2. Configure a variável `REACT_APP_API_URL`
3. Execute `npm start`
4. Acesse o dashboard
5. Verifique se os dados são carregados do banco

### 8. Fallback para Desenvolvimento

Se o backend não estiver disponível, o sistema mostrará:
- Estados de loading
- Mensagens de erro amigáveis
- Interface funcional sem dados

**Data da configuração:** $(Get-Date -Format "dd/MM/yyyy HH:mm")
