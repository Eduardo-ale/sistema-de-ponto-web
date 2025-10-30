# 🎯 GUIA DE VERIFICAÇÃO - Correção de Marcações

## Como Acessar o Módulo no Sistema

---

## 📍 **OPÇÃO 1: Através do Menu Lateral (Recomendado)**

### Passos:

1. **Faça login no sistema** como Administrador ou Gerente
   - Acesse: `http://localhost:3000` ou `http://localhost:3001`
   - Login: `admin@example.com`
   - Senha: `admin123`

2. **No Dashboard Administrativo**, procure pelo menu lateral esquerdo

3. **Encontre o item:** **"Correção de Marcações"** com ícone de relógio (🕐)

4. **Clique** em "Correção de Marcações"

5. **A página será exibida** com:
   - Header com botão "Voltar"
   - Filtros (Busca, Data, Status)
   - Tabela com as marcações

---

## 📍 **OPÇÃO 2: Através de Ações Rápidas**

### Passos:

1. **No Dashboard Principal**, procure pela seção **"Ações Rápidas"**

2. **Encontre o card:** **"Gestão de Ponto"** (cartão azul com ícone de relógio)

3. **Clique** no card "Gestão de Ponto"

4. **A página será exibida** automaticamente

---

## 🔍 O que Você Verá na Página

### **Header**
- Botão "Voltar" (seta para esquerda)
- Título: "Gestão de Ponto"
- Descrição: "Correção de marcações e histórico"
- Botão "Atualizar" (para recarregar dados)
- Badge "Visualização apenas" (se você não for admin/manager)

### **Filtros** (Linha Superior)
- 🔍 Busca por colaborador
- 📅 Filtro por data
- 🏷️ Filtro por status (Original, Corrigida)
- Limpar filtros

### **Tabela de Marcações**
**Colunas:**
- Colaborador (nome + ícone)
- Data (formato DD/MM/YYYY)
- Entrada (horário HH:MM)
- Saída (horário HH:MM)
- Status (badge verde = Corrigida, cinza = Original)
- Última Modificação (quem e quando corrigiu)
- Ações (botões)

### **Botões de Ação** (coluna direita)
- **"Corrigir"** (azul) - Visível apenas para Admin/Manager
- **"Histórico"** (roxo) - Sempre visível para todos

---

## ✅ Checklist de Verificação

### Teste 1: Visualização ✅
- [ ] Página carrega sem erros
- [ ] Tabela mostra marcações
- [ ] Botão "Voltar" funciona
- [ ] Filtros estão funcionando
- [ ] Badge de status aparece (Original/Corrigida)

### Teste 2: Permissões (Admin/Manager) ✅
- [ ] Botão "Corrigir" está visível
- [ ] Botão "Histórico" está visível
- [ ] Badge "Visualização apenas" NÃO aparece

### Teste 3: Botão "Corrigir" ✅
- [ ] Clicar abre modal de correção
- [ ] Campos são preenchidos com valores originais
- [ ] Validações funcionam:
  - [ ] Motivo obrigatório (mínimo 10 caracteres)
  - [ ] Saída deve ser posterior à entrada
  - [ ] Pelo menos um horário deve ser alterado
- [ ] Ao salvar, tabela atualiza automaticamente
- [ ] Status muda para "Corrigida"
- [ ] Toast de sucesso aparece

### Teste 4: Botão "Histórico" ✅
- [ ] Clicar abre modal de histórico
- [ ] Modal mostra timeline de correções
- [ ] Correções ordenadas (mais recente primeiro)
- [ ] Exibe valores originais → novos
- [ ] Exibe motivo da correção
- [ ] Exibe quem corrigiu e quando

### Teste 5: Filtros ✅
- [ ] Busca por colaborador funciona
- [ ] Filtro por data funciona
- [ ] Filtro por status (Original/Corrigida) funciona
- [ ] Botão "Limpar Filtros" funciona

---

## 🎨 Como Identificar Visualmente

### **Marcações Originais**
- Status: Badge **cinza** com texto "Original"
- Última Modificação: "-"
- Botões: "Corrigir" (azul) + "Histórico" (roxo)

### **Marcações Corrigidas**
- Status: Badge **verde** com texto "Corrigida"
- Última Modificação: "por Nome do Admin em DD/MM/YYYY HH:MM"
- Botões: "Corrigir" (azul) + "Histórico" (roxo)

---

## 🔐 Controle de Permissões

### **Usuário Admin ou Manager**
✅ Pode ver botão "Corrigir"  
✅ Pode corrigir marcações  
✅ Pode ver histórico  
✅ Badge "Visualização apenas" NÃO aparece  

### **Usuário Comum**
❌ NÃO vê botão "Corrigir"  
❌ Badge "Visualização apenas" aparece no header  
✅ Pode ver histórico  
✅ Pode ver tabela  

---

## 🛠️ Como Testar a Correção

### Passo a Passo Completo:

1. **Acesse** a página "Gestão de Ponto"

2. **Encontre** uma marcação com status "Original"

3. **Clique** no botão "Corrigir" (azul)

4. **No modal que abrir:**
   - Altere o horário de entrada ou saída
   - Digite um motivo (mínimo 10 caracteres)
   - Clique em "Salvar Correção"

5. **Resultado esperado:**
   - Modal fecha automaticamente
   - Toast de sucesso aparece
   - Tabela atualiza
   - Status muda para "Corrigida"
   - Última Modificação mostra seus dados

6. **Clique** em "Histórico" na mesma linha

7. **Resultado esperado:**
   - Modal abre mostrando a correção que você acabou de fazer
   - Timeline mostra a correção mais recente no topo
   - Valores originais → novos são exibidos
   - Motivo completo é exibido

---

## 📸 Capturas de Tela Esperadas

### Dashboard Principal
```
┌─────────────────────────────────────────┐
│  Dashboard Administrativo               │
├─────────────────────────────────────────┤
│                                          │
│  [Ações Rápidas]                        │
│  ┌──────────────┐ ┌──────────────┐     │
│  │ Novo Usuário │ │ Gerir Usu.   │     │
│  └──────────────┘ └──────────────┘     │
│  ┌──────────────┐ ┌──────────────┐     │
│  │ Gestão Ponto │ │ Ponto Real   │     │ ← Clique aqui!
│  └──────────────┘ └──────────────┘     │
│                                          │
└─────────────────────────────────────────┘
```

### Página de Gestão de Ponto
```
┌─────────────────────────────────────────────────────────┐
│  [← Voltar]  Gestão de Ponto      [🔄 Atualizar]       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [🔍 Buscar] [📅 Data] [🏷️ Status] [Limpar Filtros]    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Colab. │ Data  │ Entrada │ Saída │ Status │ Ações│  │
│  ├────────┼───────┼─────────┼───────┼────────┼──────┤  │
│  │ João   │24/10  │08:00    │17:00  │Original│[🔧][📋]│  │
│  │ Maria  │24/10  │07:45    │16:30  │Corrigida│[🔧][📋]│  │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ❓ Troubleshooting

### Problema: "Página não encontrada"
**Solução:** Verifique se o servidor está rodando (`npm start`)

### Problema: "Botão Corrigir não aparece"
**Solução:** Verifique se está logado como Admin ou Manager

### Problema: "Modal não abre"
**Solução:** Verifique o console do navegador para erros (F12)

### Problema: "Dados não aparecem"
**Solução:** Verifique se há dados de exemplo no `localStorage`

---

## 🎯 Resumo

**Caminho:** Dashboard → Menu Lateral "Correção de Marcações" OU Ações Rápidas "Gestão de Ponto"

**Funcionalidades:**
- ✅ Visualizar marcações
- ✅ Filtrar marcações
- ✅ Corrigir marcações (admin/manager)
- ✅ Ver histórico de correções
- ✅ Voltar ao dashboard

**Status:** ✅ Funcionando e Integrado


