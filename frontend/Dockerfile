FROM node:18-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY server.js ./
EXPOSE 8080
CMD ["node", "server.js"]
