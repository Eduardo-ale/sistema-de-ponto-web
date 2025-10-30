# Deploy - Sistema de Ponto Web 2.0

Este guia explica como executar o projeto com Docker localmente e como publicar no Render (utilizando Docker).

## Pré-requisitos
- Docker >= 20.x
- Docker Compose >= 2.x (já embutido no Docker Desktop)
- Conta no Render (opcional para deploy)

## Estrutura criada
- `Dockerfile`: build multi-stage (builder + runner)
- `.dockerignore`: reduz contexto de build
- `docker-compose.yml`: execução local
- `render.yaml`: configuração para Render.com

## Executar localmente (Docker)
```bash
# Build da imagem
docker build -t sistema-ponto:latest .

# Executar (porta 3000)
docker run --rm -p 3000:3000 -e PORT=3000 -e NODE_ENV=production sistema-ponto:latest
```
Acesse: http://localhost:3000

## Executar localmente (Docker Compose)
```bash
docker compose up --build
```

## Deploy no Render (com Docker)
1. Faça push do repositório para GitHub/GitLab
2. No Render, crie um novo Web Service
3. Render detectará o `render.yaml`; confirme as opções
4. Aguarde o build e deployment

### Variáveis de ambiente no Render
- `NODE_ENV=production`
- `PORT=3000`
- `TZ=America/Sao_Paulo` (opcional)
- Se futuramente integrar e-mail real, adicione: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, etc.

## Notas
- O servidor Node (`server.js`) serve o conteúdo estático do `build/`. O comando `npm run build` deve gerar a pasta `build/`.
- Caso sua aplicação use uma rota de saúde, ajuste `healthCheckPath` no `render.yaml`.
- Se precisar de Nginx, é possível adaptar o Dockerfile, mas o `server.js` existente é suficiente para servir o front.
