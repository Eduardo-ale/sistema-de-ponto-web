# Teste de Aprovação de Justificativa

## Objetivo
Verificar se o fluxo de aprovação de justificativas está funcionando corretamente sem travamentos.

## Pré-requisitos
1. Sistema rodando em `http://localhost:3000`
2. Usuário logado como Admin ou Manager
3. Pelo menos uma justificativa com status "Pendente" cadastrada

## Passos do Teste

### Teste 1: Aprovação Básica (sem observações)

1. **Acessar a página de Justificativas**
   - URL: `http://localhost:3000/admin-dashboard`
   - Navegar para "Justificativas" (no menu lateral ou Ações Rápidas)
   - Confirmar que está na aba "Aprovar Solicitações"

2. **Abrir modal de detalhes**
   - Clicar em uma justificativa com status "Pendente"
   - Verificar que o modal "Justificativa de Ausência/Atraso" abre

3. **Aprovar sem observações**
   - Clicar no botão verde "Aprovar"
   - Verificar que o modal de confirmação aparece
   - Clicar em "Confirmar"
   - **Verificar:**
     - ✅ Modal de confirmação fecha imediatamente
     - ✅ Overlay de loading aparece com "Processando aprovação..."
     - ✅ Após processamento, toast verde aparece: "Justificativa aprovada com sucesso!"
     - ✅ Modal principal fecha automaticamente
     - ✅ Justificativa desaparece da lista "Pendentes"
     - ✅ Justificativa aparece no "Histórico Completo" com status "Aprovado"

### Teste 2: Aprovação com Observações

1. **Acessar modal de detalhes**
   - Abrir uma justificativa pendente

2. **Preencher observações**
   - Preencher o campo "Observações (Opcional para aprovação)" com texto, ex: "testando"
   - Verificar que o texto aparece no campo

3. **Aprovar com observações**
   - Clicar no botão verde "Aprovar"
   - Clicar em "Confirmar" no modal de confirmação
   - **Verificar:**
     - ✅ Não trava a tela
     - ✅ Overlay de loading aparece
     - ✅ Toast de sucesso aparece
     - ✅ Modal fecha corretamente
     - ✅ Lista é atualizada
     - ✅ Campo de observações é limpo após sucesso

### Teste 3: Verificar Console (Debug)

1. **Abrir DevTools**
   - Pressionar F12
   - Ir para a aba "Console"

2. **Executar aprovação**
   - Preencher observações: "teste console"
   - Clicar em "Aprovar" → "Confirmar"

3. **Verificar logs no console**
   - ✅ Deve aparecer: `Iniciando aprovação...` com dados (id, user, observations)
   - ✅ Deve aparecer: `Resultado da aprovação:` com objeto `{success: true, data: {...}}`
   - ❌ NÃO deve aparecer erros vermelhos

### Teste 4: Prevenção de Múltiplas Chamadas

1. **Testar clique rápido**
   - Preencher observações
   - Clicar rapidamente várias vezes em "Aprovar" → "Confirmar"
   - **Verificar:**
     - ✅ Apenas uma aprovação é processada
     - ✅ Botão fica desabilitado durante o processamento
     - ✅ Não há travamentos ou erros

### Teste 5: Atualização de Lista

1. **Aprovar justificativa**
   - Aprovar uma justificativa pendente

2. **Verificar atualização**
   - ✅ Justificativa sai da aba "Aprovar Solicitações"
   - ✅ Aparece na aba "Histórico Completo"
   - ✅ Status mostra "Aprovado"
   - ✅ Data/hora de decisão está preenchida
   - ✅ Observações aparecem no histórico (se foram preenchidas)

## Checklist de Verificação

### Funcionalidades
- [ ] Modal abre corretamente
- [ ] Campo de observações funciona
- [ ] Botão "Aprovar" abre modal de confirmação
- [ ] Modal de confirmação funciona
- [ ] Overlay de loading aparece
- [ ] Aprovação processa sem travar
- [ ] Toast de sucesso aparece
- [ ] Modal fecha automaticamente
- [ ] Lista é atualizada corretamente
- [ ] Observações são salvas no localStorage
- [ ] Estados são limpos após sucesso

### Performance
- [ ] Sem travamentos na interface
- [ ] Resposta rápida (< 1 segundo)
- [ ] Sem erros no console
- [ ] Sem warnings críticos

### UX/UI
- [ ] Feedback visual adequado (loading, toasts)
- [ ] Botões desabilitados durante processamento
- [ ] Transições suaves
- [ ] Mensagens claras

## Resultados Esperados

✅ **Sucesso**: Todas as verificações acima devem passar
❌ **Falha**: Se alguma verificação falhar, anotar qual e o comportamento observado

## Problemas Conhecidos (Se Aplicável)

Nenhum no momento.

## Data do Teste
Data: _______________
Testador: _______________
Resultado: [ ] Sucesso [ ] Falha

## Notas Adicionais
____________________________________________________
____________________________________________________


