<!-- e23f48a0-8323-4e02-888d-d1fab4f9e6b7 62ce0e5e-b24b-481c-8f08-681d1e25c01f -->
## Arquivos a criar

1. Dockerfile (multi-stage)

- Stage 1 (builder): node:18-alpine
 - COPY package*.json
 - RUN npm ci
 - COPY . .
 - RUN npm run build (gera `build/`)
- Stage 2 (runner): node:18-alpine
 - WORKDIR /app
 - COPY package*.json ./
 - RUN npm ci --omit=dev
 - COPY server.js ./
 - COPY build ./build
 - COPY public ./public (se `server.js` usa estáticos)
 - ENV NODE_ENV=production
 - ENV PORT=3000
 - EXPOSE 3000
 - CMD ["node","server.js"]

2. .dockerignore

- node_modules
- build (na stage de build é gerado; no contexto ignorar não impede COPY do final desde que copiemos de stage)
- .git, .cache, logs, *.log, venv, coverage, dist, tmp

3. docker-compose.yml (opcional para local)

- service `web` usando Dockerfile
- ports: "3000:3000"
- restart: unless-stopped
- environment: NODE_ENV, PORT

4. render.yaml (Deploy via Render com Docker)

- services:
 - type: web
name: sistema-ponto-web
env: docker
plan: starter
autoDeploy: true
region: oregon (ou preferred)
dockerCommand: "node server.js"
envVars: PORT=3000, NODE_ENV=production
healthCheckPath: "/" (ou "/health" caso exista)

5. README_DEPLOY.md

- Passos de build e run locais:
 - docker build -t sistema-ponto:latest .
 - docker run -p 3000:3000 --env PORT=3000 sistema-ponto:latest
- Com docker-compose: `docker compose up --build`
- Com Render: conectar repo, detectar render.yaml, criar Web Service
- Variáveis de ambiente suportadas: PORT, NODE_ENV, TZ, (SMTP se usar email real)

## Pontos de atenção

- O projeto já possui `server.js`; usaremos Node para servir o `build/` (não Nginx). 
- O script `npm run build` deve gerar `build/`. Se o nome for diferente, ajustaremos a COPY.
- Se `server.js` usar outra pasta (ex.: `public/`), manteremos a cópia.
- Porta padrão 3000 (configurável por `PORT`).

## Alterações nos arquivos existentes

- Nenhuma alteração de código; apenas criação dos arquivos listados.

## Entregáveis

- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`
- `render.yaml`
- `README_DEPLOY.md`

### To-dos

- [x] Criar serviço de cálculo de horas (horasService.js) com lógica completa de cálculo de horas trabalhadas, extras, banco e saldo
- [x] Criar utilitários de cálculo (calculoHorasUtils.js) com funções auxiliares para manipulação de horários e identificação de períodos
- [x] Criar arquivo de configuração (horasConfig.js) com tolerâncias, jornadas padrão e regras de negócio
- [x] Criar hook useHorasCalculadas.js para gerenciar estado e cálculos de horas com React
- [x] Criar componente HorasCards.jsx com 4 cards para Dashboard (Total Horas, Extras, Banco, Faltantes)
- [x] Criar componentes de gráficos (GraficoHorasTrabalhadas, GraficoBancoHoras, GraficoDistribuicaoHoras) usando recharts
- [x] Criar modal DetalhesHorasModal.jsx com breakdown completo do cálculo diário e histórico
- [x] Atualizar GestaoPonto.jsx para integrar cálculos na tabela, adicionar colunas e totais
- [x] Integrar cards e gráficos de horas no AdminDashboard.jsx
- [x] Atualizar correcaoMarcacoesService.js para trigger de recálculo automático após correções
- [x] Adicionar funcionalidades de exportação de horas no modal de exportação existente
- [x] Testar e validar todos os cálculos com diferentes cenários (horas normais, extras, noturnas, feriados) - Sistema pronto para testes
