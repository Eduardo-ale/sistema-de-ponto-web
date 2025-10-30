# Stage 2: Runner - imagem enxuta para servir o build via server.js
FROM node:18-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

COPY server.js ./
COPY --from=builder /app/build ./build
# Se o server.js não usa estáticos extras, pode remover a linha abaixo
COPY public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node","server.js"]
