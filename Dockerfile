# Multi-stage build para app React + Node server

# Stage 1: Builder - compila a aplicação
FROM node:18-alpine AS builder
WORKDIR /app

# Instalar dependências apenas a partir dos manifests
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copiar código e buildar
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Runner - imagem enxuta para servir o build via server.js
FROM node:18-alpine AS runner
WORKDIR /app

# Apenas deps de produção
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps \
    && npm cache clean --force

# Copiar servidor e artefatos necessários
COPY server.js ./
COPY build ./build
COPY public ./public

# Variáveis padrão
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Healthcheck simples (opcional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:${PORT}/ || exit 1

CMD ["node", "server.js"]


