FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Debug: check if files exist
RUN ls -la dist/ && ls -la server.js

ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "echo 'Starting server...' && ls -la && node server.js"]
